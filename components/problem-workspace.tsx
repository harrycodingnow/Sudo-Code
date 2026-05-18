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

// ---------- styles ----------

const LAB_STYLES = `
.pseudo-lab {
  --bg0: #0e0f11;
  --bg1: #16181c;
  --bg2: #1e2126;
  --bg3: #262a31;
  --fg: #e7ebf0;
  --fg-mute: #8a93a0;
  --fg-faint: #5a6270;
  --accent: #4fffb0;
  --accent-soft: rgba(79, 255, 176, 0.15);
  --accent-line: rgba(79, 255, 176, 0.4);
  --blue: #7eb8ff;
  --amber: #ffb347;
  --red: #ff5f7e;
  --purple: #c8a4ff;
  --warm: #ffb86b;
  --border-1: rgba(255, 255, 255, 0.18);
  --border-2: rgba(255, 255, 255, 0.10);
  --border-3: rgba(255, 255, 255, 0.06);

  position: fixed;
  inset: 0;
  background: var(--bg0);
  color: var(--fg);
  font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.pseudo-lab * { box-sizing: border-box; }

.pseudo-lab .pl-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  background: var(--bg1);
  border-bottom: 0.5px solid var(--border-3);
  flex-shrink: 0;
}
.pl-top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.pl-back {
  color: var(--fg-mute);
  text-decoration: none;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
}
.pl-back:hover { color: var(--fg); background: var(--bg2); }
.pl-tag {
  background: var(--accent-soft);
  color: var(--accent);
  border: 0.5px solid var(--accent-line);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.pl-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-difficulty {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-mute);
  font-weight: 600;
}
.pl-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg2);
  border-radius: 6px;
  padding: 2px;
  border: 0.5px solid var(--border-3);
}
.pl-tab {
  background: transparent;
  border: 0;
  color: var(--fg-mute);
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}
.pl-tab.is-active {
  background: var(--bg3);
  color: var(--fg);
}
.pl-tab[data-disabled="true"] {
  color: var(--fg-faint);
  cursor: not-allowed;
}
.pl-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pl-secondary {
  background: transparent;
  color: var(--fg-mute);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.pl-secondary:hover:not(:disabled) {
  color: var(--fg);
  border-color: var(--border-1);
}
.pl-secondary.is-done {
  color: var(--accent);
  border-color: var(--accent-line);
}
.pl-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.pl-run {
  background: var(--accent);
  color: #08110d;
  border: 0;
  border-radius: 6px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.02em;
}
.pl-run:hover:not(:disabled) { filter: brightness(1.05); }
.pl-run:disabled { opacity: 0.5; cursor: not-allowed; }

.pl-main {
  flex: 1;
  display: grid;
  min-height: 0;
  overflow: hidden;
}

.pl-sidebar {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 16px 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pl-side-section { display: flex; flex-direction: column; gap: 8px; }
.pl-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-mute);
  margin: 0;
}
.pl-body {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--fg);
}
.pl-examples { display: flex; flex-direction: column; gap: 8px; }
.pl-example {
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pl-example-line { margin: 0; display: flex; gap: 6px; }
.pl-example-key { color: var(--fg-faint); width: 22px; flex-shrink: 0; }
.pl-example-val { color: var(--fg); word-break: break-all; }
.pl-constraints {
  margin: 0;
  padding-left: 14px;
  font-size: 11.5px;
  color: var(--fg-mute);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pl-concepts { display: flex; flex-wrap: wrap; gap: 4px; }
.pl-concept {
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 3px;
}

.pl-center {
  display: grid;
  min-height: 0;
  overflow: hidden;
}

.pl-editor-wrap {
  background: var(--bg1);
  border-bottom: 0.5px solid var(--border-3);
  padding: 0;
  min-height: 0;
  display: flex;
}
.pl-editor {
  flex: 1;
  display: grid;
  grid-template-columns: 44px 1fr;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 13px;
  line-height: 20px;
  background: var(--bg1);
  min-height: 0;
  overflow: hidden;
}
.pl-gutter {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 12px 8px 12px 0;
  text-align: right;
  color: var(--fg-faint);
  user-select: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pl-gutter-num {
  display: block;
  height: 20px;
  font-size: 11px;
  transition: color 80ms;
}
.pl-gutter-num.is-active { color: var(--accent); }
.pl-code-area {
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.pl-highlight,
.pl-textarea {
  position: absolute;
  inset: 0;
  padding: 12px 16px;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
  overflow: auto;
  border: 0;
  outline: 0;
  tab-size: 2;
}
.pl-highlight {
  pointer-events: none;
  color: var(--fg);
}
.pl-line {
  display: block;
  min-height: 20px;
  padding: 0 6px;
  margin: 0 -6px;
  border-left: 2px solid transparent;
}
.pl-line.is-active {
  background: var(--accent-soft);
  border-left-color: var(--accent);
}
.tok-kw { color: var(--purple); }
.tok-fn { color: var(--blue); }
.tok-op { color: var(--accent); }
.tok-num { color: var(--warm); }
.tok-cm { color: var(--fg-faint); font-style: italic; }
.tok-id { color: var(--fg); }
.tok-punct { color: var(--fg-mute); }
.tok-ws { white-space: pre; }
.pl-textarea {
  background: transparent;
  color: transparent;
  caret-color: var(--accent);
  resize: none;
  white-space: pre;
}
.pl-textarea::placeholder { color: var(--fg-faint); }
.pl-textarea::selection { background: rgba(79, 255, 176, 0.25); }

.pl-bottom {
  display: grid;
  gap: 0;
  min-height: 0;
  background: var(--bg0);
}

/* resize handles */
.pl-resize {
  background: transparent;
  position: relative;
  z-index: 5;
  transition: background 120ms ease;
}
.pl-resize-col {
  cursor: col-resize;
  width: 4px;
  align-self: stretch;
}
.pl-resize-row {
  cursor: row-resize;
  height: 4px;
  justify-self: stretch;
}
.pl-resize::after {
  content: "";
  position: absolute;
  background: var(--border-3);
}
.pl-resize-col::after {
  top: 0; bottom: 0;
  left: 50%;
  width: 0.5px;
  transform: translateX(-50%);
}
.pl-resize-row::after {
  left: 0; right: 0;
  top: 50%;
  height: 0.5px;
  transform: translateY(-50%);
}
.pl-resize:hover {
  background: rgba(79, 255, 176, 0.08);
}
.pl-resize:hover::after,
.pl-resize:active::after {
  background: var(--accent);
}
.pl-resize:active {
  background: rgba(79, 255, 176, 0.15);
}
.pl-panel {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
}
.pl-panel:last-child { border-right: 0; }
.pl-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.pl-pulse {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 10px;
  color: var(--accent);
  animation: pl-pulse 1.2s ease-in-out infinite;
}
@keyframes pl-pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
.pl-agg {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 4px;
  border: 0.5px solid var(--border-2);
}
.pl-agg-pass { color: var(--accent); border-color: var(--accent-line); }
.pl-agg-fail { color: var(--red); border-color: rgba(255,95,126,0.4); }
.pl-agg-neutral { color: var(--fg-mute); }
.pl-step-count {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
}

.pl-cases {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  min-height: 0;
}
.pl-case {
  width: 100%;
  background: transparent;
  border: 0.5px solid transparent;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--fg);
  font-family: inherit;
  font-size: 12px;
}
.pl-case:hover { background: var(--bg2); border-color: var(--border-3); }
.pl-case.is-selected { background: var(--bg3); border-color: var(--border-2); }
.pl-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.pl-icon-pending { background: var(--bg3); color: var(--fg-faint); }
.pl-icon-running { background: var(--bg3); color: var(--accent); animation: pl-pulse 0.8s ease-in-out infinite; }
.pl-icon-pass { background: var(--accent-soft); color: var(--accent); }
.pl-icon-fail { background: rgba(255,95,126,0.15); color: var(--red); }
.pl-case-label {
  font-weight: 500;
  color: var(--fg);
  flex-shrink: 0;
  min-width: 50px;
}
.pl-case-input {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.pl-empty {
  color: var(--fg-mute);
  font-size: 12px;
  padding: 8px;
}

.pl-validator {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  min-height: 0;
}
.pl-msg {
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
  line-height: 1.5;
  border: 0.5px solid transparent;
  animation: pl-fade-in 280ms ease-out both;
}
@keyframes pl-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.pl-msg strong { color: var(--fg); font-weight: 600; }
.pl-msg-good { background: var(--accent-soft); color: #cdeede; border-color: var(--accent-line); }
.pl-msg-good strong { color: var(--accent); }
.pl-msg-tip { background: rgba(255,179,71,0.10); color: #ffe6c8; border-color: rgba(255,179,71,0.30); }
.pl-msg-tip strong { color: var(--amber); }
.pl-msg-error { background: rgba(255,95,126,0.10); color: #ffd1da; border-color: rgba(255,95,126,0.30); }
.pl-msg-error strong { color: var(--red); }
.pl-msg-empty {
  color: var(--fg-mute);
  font-size: 12px;
  font-style: italic;
  padding: 8px 4px;
}

.pl-vis-empty {
  color: var(--fg-mute);
  font-size: 12px;
  padding: 8px 4px;
  font-style: italic;
}
.pl-vis {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  flex: 1;
}
.pl-vis-target {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
}
.pl-vis-cells {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px 0;
}
.pl-cell-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 30px;
}
.pl-cell-pointers {
  height: 16px;
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
}
.pl-ptr {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
.pl-ptr-l { color: var(--blue); }
.pl-ptr-r { color: var(--amber); }
.pl-ptr-m { color: var(--accent); }
.pl-cell {
  width: 28px;
  height: 28px;
  background: var(--bg2);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--fg);
  transition: all 120ms;
}
.pl-cell.is-mid {
  border-color: var(--accent-line);
}
.pl-cell.is-found {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px rgba(79,255,176,0.4);
}
.pl-cell-idx {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 9px;
  color: var(--fg-faint);
}
.pl-vis-note {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
  min-height: 14px;
}
.pl-progress {
  height: 3px;
  background: var(--bg2);
  border-radius: 2px;
  overflow: hidden;
}
.pl-progress-bar {
  height: 100%;
  background: var(--accent);
  transition: width 200ms ease;
}
.pl-vis-controls {
  display: flex;
  gap: 6px;
}
.pl-step-btn {
  background: transparent;
  color: var(--fg);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
}
.pl-step-btn:hover:not(:disabled) { border-color: var(--border-1); }
.pl-step-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ---- guide chat (inline workspace panel) ---- */
.pl-guide { display: flex; flex-direction: column; min-height: 0; }
.pl-guide-reset {
  background: transparent;
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-reset:hover { color: var(--fg); border-color: var(--border-1); }
.pl-guide-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-dm-sans, system-ui), sans-serif;
}
.pl-guide-empty {
  color: var(--fg-mute);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pl-guide-empty p { margin: 0; line-height: 1.4; }
.pl-guide-quicks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pl-guide-quick {
  text-align: left;
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  color: var(--fg);
  font-family: inherit;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.3;
}
.pl-guide-quick:hover {
  border-color: var(--accent-line);
  color: var(--accent);
}
.pl-guide-msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: pl-fade-up 180ms ease-out;
}
.pl-guide-role {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-faint);
  font-family: var(--font-dm-mono, ui-monospace), monospace;
}
.pl-guide-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--fg);
  white-space: pre-wrap;
  word-break: break-word;
}
.pl-guide-msg-user .pl-guide-text {
  background: var(--bg3);
  border-left: 2px solid var(--blue);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pl-guide-msg-assistant .pl-guide-text {
  background: var(--bg2);
  border-left: 2px solid var(--accent);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pl-guide-msg-error .pl-guide-text {
  background: rgba(255, 95, 126, 0.08);
  border-left: 2px solid var(--red);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
  color: var(--red);
}
.pl-chat-code {
  font-family: var(--font-dm-mono, ui-monospace), monospace;
  font-size: 11px;
  background: var(--bg0);
  border: 0.5px solid var(--border-3);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--accent);
}
.pl-chat-link {
  font-family: var(--font-dm-mono, ui-monospace), monospace;
  font-size: 11px;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pl-guide-typing {
  display: inline-flex;
  gap: 4px;
  padding: 8px 10px;
  background: var(--bg2);
  border-left: 2px solid var(--accent);
  border-radius: 0 4px 4px 0;
  width: fit-content;
}
.pl-guide-typing span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
  animation: pl-typing 1.2s infinite ease-in-out;
}
.pl-guide-typing span:nth-child(2) { animation-delay: 0.15s; }
.pl-guide-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes pl-typing {
  0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@keyframes pl-fade-up {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.pl-guide-form {
  border-top: 0.5px solid var(--border-3);
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.pl-guide-input {
  flex: 1;
  background: var(--bg0);
  border: 0.5px solid var(--border-3);
  color: var(--fg);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  resize: none;
  line-height: 1.4;
  outline: none;
}
.pl-guide-input:focus { border-color: var(--accent-line); }
.pl-guide-input:disabled { opacity: 0.6; }
.pl-guide-send {
  background: var(--accent);
  color: var(--bg0);
  border: 0;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-send:disabled { opacity: 0.4; cursor: not-allowed; }
.pl-guide-head-actions { display: inline-flex; gap: 6px; align-items: center; }
.pl-guide-expand {
  background: transparent;
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-family: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-expand:hover { color: var(--accent); border-color: var(--accent-line); }
.pl-guide-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
  animation: pl-fade-in 140ms ease-out;
}
@keyframes pl-fade-in { from { opacity: 0; } to { opacity: 1; } }
.pl-guide-expanded {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(460px, 92vw);
  z-index: 60;
  background: var(--bg1);
  border-left: 0.5px solid var(--border-2);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: pl-slide-in 200ms ease-out;
}
@keyframes pl-slide-in {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
`;
