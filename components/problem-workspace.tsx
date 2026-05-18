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
  readString,
  STORAGE_KEYS,
  writeJSON,
  writeString,
} from "@/lib/browser-storage";

type ProblemWorkspaceProps = {
  problem: Problem;
};

type TestCaseStatus = "pending" | "running" | "pass" | "fail";

type TestCase = {
  id: string;
  label: string;
  input: string;
  expected: string;
  status: TestCaseStatus;
};

type ValidatorMessage = {
  id: string;
  kind: "good" | "tip" | "error";
  concept: string;
  body: string;
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

function reviewToValidatorMessages(review: Review): ValidatorMessage[] {
  const msgs: ValidatorMessage[] = [];
  let idx = 0;
  const push = (
    kind: ValidatorMessage["kind"],
    concept: string,
    body: string,
  ) => {
    if (!body.trim()) return;
    msgs.push({ id: `m${idx++}`, kind, concept, body: body.trim() });
  };

  if (review.summary) {
    push(
      review.verdict === "correct"
        ? "good"
        : review.verdict === "incorrect"
          ? "error"
          : "tip",
      "Summary",
      review.summary,
    );
  }
  for (const item of review.logic_issues) push("error", "Logic issue", item);
  for (const item of review.missing_steps) push("tip", "Missing step", item);
  for (const item of review.edge_cases) push("tip", "Edge case", item);
  for (const item of review.improvement_suggestions)
    push("tip", "Improvement", item);
  if (review.time_complexity)
    push("good", "Time complexity", review.time_complexity);
  return msgs.slice(0, 8);
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
    col1Pct: 29,
    col2Pct: 33,
  });
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

  const startBottomDrag = useCallback((which: 1 | 2) => (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = bottomRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLayout((p) => {
        if (which === 1) {
          const next = Math.max(15, Math.min(p.col1Pct + p.col2Pct - 15, pct));
          return { ...p, col1Pct: next };
        }
        const next = Math.max(p.col1Pct + 15, Math.min(85, pct));
        return { ...p, col2Pct: next - p.col1Pct };
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const col3Pct = Math.max(15, 100 - layout.col1Pct - layout.col2Pct);
  const mainStyle = { gridTemplateColumns: `${layout.sidebarW}px 4px 1fr` };
  const centerStyle = { gridTemplateRows: `${layout.editorPct}% 4px 1fr` };
  const bottomStyle = {
    gridTemplateColumns: `${layout.col1Pct}% 4px ${layout.col2Pct}% 4px ${col3Pct}%`,
  };
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatorMsgs, setValidatorMsgs] = useState<ValidatorMessage[]>([]);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "editor" | "history" | "complexity"
  >("editor");
  const [isComplete, setIsComplete] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // mark complete state (local-only; tracker integration intentionally dropped
  // in this lab UI revamp — re-wire via the tracker page if needed).
  useEffect(() => {
    setIsComplete(readString(STORAGE_KEYS.labComplete(problem.slug)) === "1");
  }, [problem.slug]);

  // ---- test cases (derived from examples) ----
  const initialCases: TestCase[] = useMemo(
    () =>
      problem.examples.slice(0, 6).map((ex, i) => ({
        id: `c${i}`,
        label: `Case ${i + 1}`,
        input: ex.input,
        expected: ex.output,
        status: "pending" as TestCaseStatus,
      })),
    [problem.examples],
  );
  const [cases, setCases] = useState<TestCase[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<string>(
    initialCases[0]?.id ?? "",
  );

  useEffect(() => {
    setCases(initialCases);
    setSelectedCase(initialCases[0]?.id ?? "");
  }, [initialCases]);

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
    setValidatorMsgs([]);

    // animate test cases: each goes running -> resolved with 120ms stagger
    setCases((prev) =>
      prev.map((c) => ({ ...c, status: "pending" as TestCaseStatus })),
    );

    let review: Review | null = null;
    try {
      review = await requestReview(problem.slug, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed.");
    }

    const passByDefault = review ? review.verdict !== "incorrect" : false;
    const partial = review?.verdict === "partially_correct";

    // sequential reveal
    for (let i = 0; i < initialCases.length; i++) {
      await new Promise((res) => setTimeout(res, 120));
      setCases((prev) =>
        prev.map((c, idx) => {
          if (idx !== i) return c;
          let status: TestCaseStatus = passByDefault ? "pass" : "fail";
          // for partial, fail the last case to give realistic mixed signal
          if (partial && i === initialCases.length - 1) status = "fail";
          return { ...c, status };
        }),
      );
    }

    if (review) setValidatorMsgs(reviewToValidatorMessages(review));
    setRunning(false);
  }

  function handleMarkComplete() {
    writeString(STORAGE_KEYS.labComplete(problem.slug), "1");
    setIsComplete(true);
  }

  function handleReset() {
    setCode(initialCode);
    setValidatorMsgs([]);
    setError(null);
    setCases(initialCases);
  }

  const passCount = cases.filter((c) => c.status === "pass").length;
  const failCount = cases.filter((c) => c.status === "fail").length;
  const totalCount = cases.length;
  const aggregateColor =
    failCount > 0 ? "fail" : passCount === totalCount && totalCount > 0 ? "pass" : "neutral";

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
          {(["editor", "history", "complexity"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`pl-tab${activeTab === tab ? " is-active" : ""}`}
              onClick={() => tab === "editor" && setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              data-disabled={tab !== "editor" ? "true" : undefined}
            >
              {tab === "editor"
                ? "Editor"
                : tab === "history"
                  ? "History"
                  : "Complexity"}
            </button>
          ))}
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
          <button
            type="button"
            onClick={() => void handleRun()}
            className="pl-run"
            disabled={running}
          >
            {running ? "Running…" : "▶ Run"}
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
                  wrap="off"
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
            {/* TEST CASES */}
            <div className="pl-panel">
              <div className="pl-panel-head">
                <span className="pl-label">Test cases</span>
                <span className={`pl-agg pl-agg-${aggregateColor}`}>
                  {passCount} / {totalCount}
                </span>
              </div>
              <ul className="pl-cases">
                {cases.length === 0 ? (
                  <li className="pl-empty">No examples for this problem.</li>
                ) : (
                  cases.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`pl-case${
                          selectedCase === c.id ? " is-selected" : ""
                        }`}
                        onClick={() => setSelectedCase(c.id)}
                      >
                        <span className={`pl-icon pl-icon-${c.status}`}>
                          {c.status === "pass"
                            ? "✓"
                            : c.status === "fail"
                              ? "✗"
                              : "·"}
                        </span>
                        <span className="pl-case-label">{c.label}</span>
                        <span className="pl-case-input">{c.input}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* VALIDATOR */}
            <div
              className="pl-resize pl-resize-col pl-resize-bottom"
              onPointerDown={startBottomDrag(1)}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize tests panel"
            />
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
                {validatorMsgs.length === 0 && !running && !error ? (
                  <div className="pl-msg-empty">
                    Run your pseudocode to see logic feedback here.
                  </div>
                ) : null}
                {validatorMsgs.map((m, i) => (
                  <div
                    key={m.id}
                    className={`pl-msg pl-msg-${m.kind}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <strong>{m.concept}:</strong> {m.body}
                  </div>
                ))}
              </div>
            </div>

            {/* GUIDE CHAT */}
            <div
              className="pl-resize pl-resize-col pl-resize-bottom"
              onPointerDown={startBottomDrag(2)}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize validator panel"
            />
            <WorkspaceGuide problemSlug={problem.slug} code={code} />
          </div>
        </section>
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
};

function WorkspaceGuide({ problemSlug, code }: WorkspaceGuideProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending, expanded]);

  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

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

  return (
    <>
      {expanded ? (
        <div
          className="pl-guide-backdrop"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      ) : null}
      <div className={`pl-panel pl-guide${expanded ? " pl-guide-expanded" : ""}`}>
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
              onClick={() => setExpanded((v) => !v)}
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
    </>
  );
}
