"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type UIEvent,
} from "react";

import type { Review } from "@/lib/review-schema";
import type { Problem } from "@/types/problem";
import { LAB_STYLES } from "@/components/problem-workspace.styles";

import {
  readJSON,
  STORAGE_KEYS,
  writeJSON,
} from "@/lib/browser-storage";
import {
  isTrackerSlugCompleted,
  markTrackerSlugCompleted,
} from "@/lib/tracker";

type ProblemWorkspaceProps = {
  problem: Problem;
};

type ValidatorDetail = { label: string; body: string; quote?: string };
type ValidatorSection = {
  id: string;
  kind: "summary" | "good" | "fix" | "notes";
  title: string;
  lead: string;
  details: ValidatorDetail[];
};

// ---------- syntax highlighting ----------

const KEYWORDS = new Set([
  "set",
  "while",
  "for",
  "if",
  "else",
  "elif",
  "return",
  "break",
  "continue",
  "and",
  "or",
  "not",
  "in",
  "to",
  "from",
  "do",
  "then",
  "loop",
  "until",
  "let",
  "define",
  "function",
]);

type Tok = { t: string; v: string };

function tokenizeLine(line: string): Tok[] {
  const tokens: Tok[] = [];
  const commentIdx = line.indexOf("//");
  let code = line;
  let comment = "";
  if (commentIdx >= 0) {
    code = line.slice(0, commentIdx);
    comment = line.slice(commentIdx);
  }
  const re = /(\s+)|([A-Za-z_][A-Za-z0-9_]*)|(\d+(?:\.\d+)?)|([=<>!+\-*/%≤≥←→]+)|(.)/g;
  let m: RegExpExecArray | null;
  let prev = "";
  while ((m = re.exec(code))) {
    const [, ws, ident, num, op, other] = m;
    if (ws) {
      tokens.push({ t: "ws", v: ws });
      continue;
    }
    if (ident) {
      if (KEYWORDS.has(ident.toLowerCase())) {
        tokens.push({ t: "kw", v: ident });
      } else if (prev === "(" || /[A-Za-z_]/.test(ident)) {
        // function-call heuristic: identifier followed by '('
        const rest = code.slice(re.lastIndex);
        if (/^\s*\(/.test(rest)) {
          tokens.push({ t: "fn", v: ident });
        } else {
          tokens.push({ t: "id", v: ident });
        }
      } else {
        tokens.push({ t: "id", v: ident });
      }
      prev = ident;
      continue;
    }
    if (num) {
      tokens.push({ t: "num", v: num });
      prev = num;
      continue;
    }
    if (op) {
      tokens.push({ t: "op", v: op });
      prev = op;
      continue;
    }
    if (other) {
      tokens.push({ t: "punct", v: other });
      prev = other;
      continue;
    }
  }
  if (comment) tokens.push({ t: "cm", v: comment });
  return tokens;
}

function renderHighlighted(code: string, activeLine: number | null): ReactNode {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const tokens = tokenizeLine(line);
        return (
          <div
            key={i}
            className={`pl-line${activeLine === i ? " is-active" : ""}`}
          >
            {tokens.length === 0 ? (
              <span>&nbsp;</span>
            ) : (
              tokens.map((tok, j) => (
                <span key={j} className={`tok-${tok.t}`}>
                  {tok.v}
                </span>
              ))
            )}
            {/* trailing newline glyph so empty lines have height */}
            {line.length === 0 ? <span>&nbsp;</span> : null}
          </div>
        );
      })}
    </>
  );
}

// ---------- review API ----------

async function requestReview(problemSlug: string, pseudocode: string) {
  const response = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemSlug, pseudocode, reviewMode: "standard" }),
  });
  const data = (await response.json()) as {
    review?: Review;
    error?: string;
  };
  if (!response.ok || !data.review) {
    throw new Error(data.error || "Could not run review.");
  }
  return data.review;
}

function firstSentence(text: string): string {
  const t = text.trim();
  if (!t) return "";
  const m = t.match(/^.*?[.!?](?:\s|$)/);
  return (m ? m[0] : t).trim();
}

function joinSentences(parts: string[], max = 2): string {
  const cleaned = parts.map((p) => p.trim()).filter(Boolean);
  const out = cleaned.slice(0, max).map((p) => firstSentence(p));
  return out
    .map((s) => (/[.!?]$/.test(s) ? s : s + "."))
    .join(" ")
    .trim();
}

function reviewToSections(review: Review): ValidatorSection[] {
  const sections: ValidatorSection[] = [];

  // 1. SUMMARY — 1–2 sentences, no expand
  if (review.summary?.trim()) {
    sections.push({
      id: "summary",
      kind: "summary",
      title: "Summary",
      lead: joinSentences([review.summary], 2),
      details: [],
    });
  }

  // 2. WHAT YOU GOT RIGHT — one sentence lead, details = remaining strengths
  const strengths = (review.strengths ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (strengths.length > 0) {
    const [lead, ...rest] = strengths;
    sections.push({
      id: "good",
      kind: "good",
      title: "What you got right",
      lead: firstSentence(lead),
      details: [
        ...(lead.length > firstSentence(lead).length
          ? [{ label: "More on this", body: lead }]
          : []),
        ...rest.map((body, i) => ({ label: `Also #${i + 1}`, body })),
      ],
    });
  }

  // 3. WHAT TO FIX — merges logic_issues, missing_steps, edge_cases,
  // clarifications, improvements. One-sentence lead picks the highest-priority
  // item; everything else lives behind the expand.
  type FixItem = { label: string; body: string; quote?: string };
  const fixes: FixItem[] = [];
  for (const body of review.logic_issues ?? [])
    if (body.trim()) fixes.push({ label: "Logic issue", body: body.trim() });
  for (const body of review.missing_steps ?? [])
    if (body.trim()) fixes.push({ label: "Missing step", body: body.trim() });
  for (const body of review.edge_cases ?? [])
    if (body.trim()) fixes.push({ label: "Edge case", body: body.trim() });
  for (const c of review.clarifications ?? []) {
    if (c.question?.trim())
      fixes.push({
        label: "Clarify",
        body: c.question.trim(),
        quote: c.quote?.trim() || undefined,
      });
  }
  for (const body of review.improvement_suggestions ?? [])
    if (body.trim()) fixes.push({ label: "Improvement", body: body.trim() });

  // de-dup on lowercase body
  const seen = new Set<string>();
  const uniqueFixes = fixes.filter((f) => {
    const k = f.body.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (uniqueFixes.length > 0) {
    const [head, ...rest] = uniqueFixes;
    sections.push({
      id: "fix",
      kind: "fix",
      title: "What to fix",
      lead: firstSentence(head.body),
      details: [
        ...(head.body.length > firstSentence(head.body).length || head.quote
          ? [
              {
                label: head.label,
                body: head.body,
                quote: head.quote,
              },
            ]
          : []),
        ...rest,
      ],
    });
  }

  // 4. COMPLEXITY — compact card summarising big-O analysis.
  const tc = review.time_complexity?.trim();
  const sc = review.space_complexity?.trim();
  if (tc || sc) {
    const parts: string[] = [];
    if (tc) parts.push(`Time ${tc}`);
    if (sc) parts.push(`Space ${sc}`);
    sections.push({
      id: "complexity",
      kind: "notes",
      title: "Complexity",
      lead: parts.join(" · "),
      details: [],
    });
  }

  // 5. INTERVIEWER FOLLOW-UP — surface the prompt's suggested next questions.
  const followups = (review.interviewer_followup ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (followups.length > 0) {
    const [first, ...rest] = followups;
    sections.push({
      id: "followup",
      kind: "notes",
      title: "Interviewer follow-up",
      lead: firstSentence(first),
      details: [
        ...(first.length > firstSentence(first).length
          ? [{ label: "More on this", body: first }]
          : []),
        ...rest.map((body, i) => ({ label: `Follow-up #${i + 2}`, body })),
      ],
    });
  }

  return sections;
}

// ---------- main component ----------

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const initialCode = problem.starterPseudocode || "";
  const [code, setCode] = useState(initialCode);

  // ----- resizable layout -----
  const mainRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const layoutKey = STORAGE_KEYS.workspaceLayout(problem.slug);
  const [layout, setLayout] = useState({
    sidebarW: 220,
    editorPct: 70,
    validatorPct: 50,
    guideW: 380,
  });
  const [guideExpanded, setGuideExpanded] = useState(false);
  const toggleGuideExpanded = useCallback(() => {
    setGuideExpanded((v) => !v);
  }, []);
  useEffect(() => {
    const v = readJSON<Partial<typeof layout> | null>(layoutKey, null);
    if (v && typeof v === "object") setLayout((p) => ({ ...p, ...v }));
  }, [layoutKey]);
  useEffect(() => {
    writeJSON(layoutKey, layout);
  }, [layout, layoutKey]);

  const startSidebarDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = layout.sidebarW;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(160, Math.min(440, startW + (ev.clientX - startX)));
      setLayout((p) => ({ ...p, sidebarW: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [layout.sidebarW]);

  const startEditorDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const rect = centerRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      const next = Math.max(25, Math.min(85, pct));
      setLayout((p) => ({ ...p, editorPct: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const startBottomDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const rect = bottomRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      const next = Math.max(20, Math.min(80, pct));
      setLayout((p) => ({ ...p, validatorPct: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const startGuideDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = layout.guideW;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      // drag left edge of guide → moving left grows the guide
      const next = Math.max(260, Math.min(720, startW - (ev.clientX - startX)));
      setLayout((p) => ({ ...p, guideW: next }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [layout.guideW]);

  const mainStyle = guideExpanded
    ? {
        gridTemplateColumns: `${layout.sidebarW}px 4px 1fr 4px ${layout.guideW}px`,
      }
    : { gridTemplateColumns: `${layout.sidebarW}px 4px 1fr` };
  const centerStyle = { gridTemplateRows: `${layout.editorPct}% 4px 1fr` };
  const bottomStyle = guideExpanded
    ? { gridTemplateColumns: `1fr` }
    : { gridTemplateColumns: `${layout.validatorPct}% 4px 1fr` };
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<ValidatorSection[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // mark complete state — sourced from the slug-scoped tracker store so the
  // workspace and the /tracker page stay in sync without ever clobbering
  // entries for other slugs.
  useEffect(() => {
    setIsComplete(isTrackerSlugCompleted(problem.slug));
  }, [problem.slug]);

  // ---- editor scroll sync ----
  const handleScroll = useCallback((e: UIEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (highlightRef.current) highlightRef.current.scrollTop = t.scrollTop;
    if (highlightRef.current) highlightRef.current.scrollLeft = t.scrollLeft;
    if (gutterRef.current) gutterRef.current.scrollTop = t.scrollTop;
  }, []);

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // ---- run ----
  async function handleRun(e?: FormEvent) {
    e?.preventDefault();
    if (running) return;
    if (!code.trim()) {
      setError("Write some pseudocode first.");
      return;
    }
    setRunning(true);
    setError(null);
    setSections([]);
    setOpenSections({});

    try {
      const review = await requestReview(problem.slug, code);
      setSections(reviewToSections(review));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed.");
    } finally {
      setRunning(false);
    }
  }

  function handleMarkComplete() {
    markTrackerSlugCompleted(problem.slug);
    setIsComplete(true);
  }

  function handleReset() {
    setCode(initialCode);
    setSections([]);
    setOpenSections({});
    setError(null);
  }

  return (
    <div className="pseudo-lab">
      <style jsx>{LAB_STYLES}</style>

      {/* TOP BAR */}
      <header className="pl-topbar">
        <div className="pl-top-left">
          <Link href="/problems" className="pl-back" aria-label="Back">
            ←
          </Link>
          <span className="pl-tag">{problem.category}</span>
          <h1 className="pl-title">{problem.title}</h1>
          <span className="pl-difficulty">{problem.difficulty}</span>
        </div>
        <nav className="pl-tabs" aria-label="Workspace tabs">
          <button
            type="button"
            onClick={() => void handleRun()}
            className="pl-run"
            disabled={running}
          >
            {running ? "Running…" : "▶ Run"}
          </button>
        </nav>
        <div className="pl-top-right">
          <button
            type="button"
            onClick={handleReset}
            className="pl-secondary"
            disabled={running}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleMarkComplete}
            className={`pl-secondary${isComplete ? " is-done" : ""}`}
            disabled={running}
          >
            {isComplete ? "✓ Complete" : "Mark complete"}
          </button>
        </div>
      </header>

      <div className="pl-main" ref={mainRef} style={mainStyle}>
        {/* LEFT SIDEBAR */}
        <aside className="pl-sidebar">
          <div className="pl-side-section">
            <p className="pl-label">Problem</p>
            <p className="pl-body">{problem.description}</p>
          </div>
          <div className="pl-side-section">
            <p className="pl-label">Examples</p>
            <div className="pl-examples">
              {problem.examples.slice(0, 3).map((ex, i) => (
                <div key={i} className="pl-example">
                  <p className="pl-example-line">
                    <span className="pl-example-key">in</span>
                    <span className="pl-example-val">{ex.input}</span>
                  </p>
                  <p className="pl-example-line">
                    <span className="pl-example-key">out</span>
                    <span className="pl-example-val">{ex.output}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          {problem.constraints.length ? (
            <div className="pl-side-section">
              <p className="pl-label">Constraints</p>
              <ul className="pl-constraints">
                {problem.constraints.slice(0, 5).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {problem.keyConcepts.length ? (
            <div className="pl-side-section">
              <p className="pl-label">Concepts</p>
              <div className="pl-concepts">
                {problem.keyConcepts.map((k) => (
                  <span key={k} className="pl-concept">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {problem.examples.length ? (
            <div className="pl-side-section">
              <p className="pl-label">Test cases</p>
              <ol className="pl-side-cases">
                {problem.examples.slice(0, 6).map((ex, i) => (
                  <li key={i} className="pl-side-case">
                    <span className="pl-side-case-num">{i + 1}.</span>
                    <span className="pl-side-case-body">
                      <span className="pl-side-case-row">
                        <span className="pl-side-case-key">in</span>
                        <span className="pl-side-case-val">{ex.input}</span>
                      </span>
                      <span className="pl-side-case-row">
                        <span className="pl-side-case-key">out</span>
                        <span className="pl-side-case-val">{ex.output}</span>
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </aside>

        <div
          className="pl-resize pl-resize-col"
          onPointerDown={startSidebarDrag}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />

        {/* CENTER: editor (top) + bottom row (test/validator/visualizer) */}
        <section className="pl-center" ref={centerRef} style={centerStyle}>
          <div className="pl-editor-wrap">
            <div className="pl-editor">
              <div ref={gutterRef} className="pl-gutter" aria-hidden="true">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <span
                    key={i}
                    className={`pl-gutter-num${
                      activeLine === i ? " is-active" : ""
                    }`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="pl-code-area">
                <div ref={highlightRef} className="pl-highlight" aria-hidden="true">
                  {renderHighlighted(code, activeLine)}
                </div>
                <textarea
                  ref={editorRef}
                  className="pl-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  spellCheck={false}
                  wrap="soft"
                  autoCapitalize="off"
                  autoCorrect="off"
                  placeholder="// describe your algorithm, one step per line"
                />
              </div>
            </div>
          </div>

          <div
            className="pl-resize pl-resize-row"
            onPointerDown={startEditorDrag}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize editor"
          />

          <div className="pl-bottom" ref={bottomRef} style={bottomStyle}>
            {/* VALIDATOR */}
            <div className="pl-panel">
              <div className="pl-panel-head">
                <span className="pl-label">Logic validator</span>
                {running ? <span className="pl-pulse">thinking…</span> : null}
              </div>
              <div className="pl-validator">
                {error ? (
                  <div className="pl-msg pl-msg-error">
                    <strong>Error:</strong>&nbsp;{error}
                  </div>
                ) : null}
                {sections.length === 0 && !running && !error ? (
                  <div className="pl-msg-empty">
                    Run your pseudocode to see logic feedback here.
                  </div>
                ) : null}
                {sections.map((s, i) => {
                  const isOpen = !!openSections[s.id];
                  const canExpand = s.details.length > 0;
                  return (
                    <div
                      key={s.id}
                      className={`pl-msg pl-msg-${s.kind}`}
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="pl-msg-head">
                        <strong>{s.title}:</strong>{" "}
                        <span className="pl-msg-lead">{s.lead}</span>
                        {canExpand ? (
                          <button
                            type="button"
                            className="pl-msg-toggle"
                            onClick={() =>
                              setOpenSections((prev) => ({
                                ...prev,
                                [s.id]: !prev[s.id],
                              }))
                            }
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "Hide details" : `Show details (${s.details.length})`}
                          </button>
                        ) : null}
                      </div>
                      {canExpand && isOpen ? (
                        <ol className="pl-msg-list">
                          {s.details.map((d, j) => (
                            <li key={j}>
                              <span className="pl-msg-detail-label">
                                {d.label}:
                              </span>{" "}
                              {d.body}
                              {d.quote ? (
                                <div className="pl-msg-quote">“{d.quote}”</div>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GUIDE CHAT — inline when collapsed, side column when expanded */}
            {!guideExpanded ? (
              <div
                className="pl-resize pl-resize-col pl-resize-bottom"
                onPointerDown={startBottomDrag}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize validator panel"
              />
            ) : null}
            <WorkspaceGuide
              problemSlug={problem.slug}
              code={code}
              expanded={guideExpanded}
              onToggleExpanded={toggleGuideExpanded}
              renderMode="inline"
            />
          </div>
        </section>

        {guideExpanded ? (
          <>
            <div
              className="pl-resize pl-resize-col"
              onPointerDown={startGuideDrag}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize guide panel"
            />
            <aside className="pl-guide-column">
              <WorkspaceGuide
                problemSlug={problem.slug}
                code={code}
                expanded={guideExpanded}
                onToggleExpanded={toggleGuideExpanded}
                renderMode="side"
              />
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ---------- guide chat ----------

type ChatMsg = {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
};

function renderInline(text: string): ReactNode {
  // backticks -> code/link tokens
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const inner = part.slice(1, -1);
      if (inner.startsWith("/")) {
        return (
          <Link key={i} href={inner} className="pl-chat-link">
            {inner}
          </Link>
        );
      }
      return (
        <code key={i} className="pl-chat-code">
          {inner}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type WorkspaceGuideProps = {
  problemSlug: string;
  code: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  renderMode: "inline" | "side";
};

function WorkspaceGuide({
  problemSlug,
  code,
  expanded,
  onToggleExpanded,
  renderMode,
}: WorkspaceGuideProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending, expanded]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onToggleExpanded();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, onToggleExpanded]);

  const quickPrompts = useMemo(
    () => [
      "What should I think about first?",
      "Give me a hint without spoiling it",
      "Explain the core idea conceptually",
      "Am I overcomplicating this?",
    ],
    [],
  );

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    try {
      const apiMessages = nextHistory
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      const draftPseudocode = code.trim() ? code : undefined;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: { page: "workspace", problemSlug },
          draftPseudocode,
        }),
      });
      const data = (await res.json()) as {
        message?: { id: string; role: "assistant"; content: string };
        error?: string;
      };
      if (!res.ok || !data.message) {
        throw new Error(data.error || "Guide is offline.");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: data.message!.id,
          role: "assistant",
          content: data.message!.content,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "error",
          content: err instanceof Error ? err.message : "Guide failed.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  // Render rules:
  //  - inline + expanded: render nothing (the real panel lives in the side column)
  //  - inline + collapsed: show the real guide panel inline (in bottom row)
  //  - side: always show the real guide panel (only mounts when expanded)
  if (renderMode === "inline" && expanded) {
    return null;
  }

  return (
    <div className={`pl-panel pl-guide${renderMode === "side" ? " pl-guide-side" : ""}`}>
      <div className="pl-panel-head">
        <span className="pl-label">Guide</span>
        <div className="pl-guide-head-actions">
          {messages.length > 0 ? (
            <button
              type="button"
              className="pl-guide-reset"
              onClick={() => setMessages([])}
            >
              reset
            </button>
          ) : null}
          <button
            type="button"
            className="pl-guide-expand"
            onClick={onToggleExpanded}
            aria-label={expanded ? "Collapse guide" : "Expand guide"}
            title={expanded ? "Collapse (Esc)" : "Expand"}
          >
            {expanded ? "⤫" : "⤢"}
          </button>
        </div>
      </div>
      <div className="pl-guide-body" ref={listRef}>
        {messages.length === 0 && !sending ? (
          <div className="pl-guide-empty">
            <p>Stuck? Ask the guide. It nudges, never solves.</p>
            <div className="pl-guide-quicks">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="pl-guide-quick"
                  onClick={() => void send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`pl-guide-msg pl-guide-msg-${m.role}`}>
              <div className="pl-guide-role">
                {m.role === "user"
                  ? "you"
                  : m.role === "assistant"
                    ? "guide"
                    : "error"}
              </div>
              <div className="pl-guide-text">{renderInline(m.content)}</div>
            </div>
          ))
        )}
        {sending ? (
          <div className="pl-guide-msg pl-guide-msg-assistant">
            <div className="pl-guide-role">guide</div>
            <div className="pl-guide-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>
      <form className="pl-guide-form" onSubmit={handleSubmit}>
        <textarea
          className="pl-guide-input"
          placeholder="Ask the guide…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          disabled={sending}
        />
        <button
          type="submit"
          className="pl-guide-send"
          disabled={sending || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
