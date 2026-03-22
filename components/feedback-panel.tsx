"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type SVGProps,
} from "react";

import type {
  FeedbackPanelMode,
  GuideAnswerVerdict,
  GuideSessionResponse,
  Review,
  ReviewVerdict,
} from "@/lib/review-schema";

const verdictCopy: Record<ReviewVerdict, { label: string }> = {
  correct: {
    label: "Logic looks solid",
  },
  partially_correct: {
    label: "Close, but missing pieces",
  },
  incorrect: {
    label: "Approach needs revision",
  },
};

type FeedbackPanelProps = {
  feedback: Review | null;
  problemSlug: string;
  pseudocode: string;
  resetSignal: number;
  panelMode: FeedbackPanelMode;
  onPanelModeChange: (mode: FeedbackPanelMode) => void;
  guideSession: GuideSessionResponse | null;
  guideIsStale: boolean;
  guideLoading: boolean;
  guideActionLoading: boolean;
  guideError: string | null;
  onGuideAnswerSubmit: (answer: string) => Promise<void> | void;
  onGuideReveal: () => Promise<void> | void;
  onGuideAdvance: () => void;
  reviewLoading: boolean;
  error: string | null;
  className?: string;
};

function buildResultFeedbackText(feedback: Review) {
  const verdict = verdictCopy[feedback.verdict].label;

  // Sentence 1: verdict + summary
  const sentence1 = `${verdict}. ${feedback.summary.trim()}`;

  // Sentence 2: most important issue or improvement (pick first non-empty)
  const topIssue = [
    ...feedback.logic_issues,
    ...feedback.missing_steps,
    ...feedback.improvement_suggestions,
  ][0];
  const sentence2 = topIssue ? topIssue.trim() : null;

  // Sentence 3: complexity
  const sentence3 = `Time: ${feedback.time_complexity} · Space: ${feedback.space_complexity}.`;

  return [sentence1, sentence2, sentence3]
    .filter((s): s is string => Boolean(s?.trim()))
    .join(" ");
}

const coachShellSurfaceClass =
  "border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

const coachCardSurfaceClass =
  "border border-white/10 bg-[linear-gradient(180deg,rgba(68,74,92,0.72)_0%,rgba(55,61,78,0.76)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

const coachPillSurfaceClass =
  "border border-white/10 bg-[rgba(36,42,58,0.76)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

const coachTabActiveClass =
  "bg-[rgba(96,101,120,0.8)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

const coachAccentButtonClass =
  "bg-[linear-gradient(180deg,#86d39b_0%,#6dbf84_100%)] text-[#142018] shadow-[0_14px_28px_rgba(63,118,84,0.3)]";

const coachAnswerSurfaceClass =
  "border border-[#7ebf93]/70 bg-[linear-gradient(180deg,rgba(79,85,103,0.68)_0%,rgba(65,71,88,0.72)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

function PanelIcon({
  name,
  className = "h-4 w-4",
}: {
  name: "check" | "cross" | "submit" | "advance";
  className?: string;
}) {
  const props: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "check":
      return (
        <svg {...props}>
          <path d="m3.5 8.5 2.5 2.5 6-6" />
        </svg>
      );
    case "cross":
      return (
        <svg {...props}>
          <path d="M4 4l8 8M12 4 4 12" />
        </svg>
      );
    case "submit":
      return (
        <svg {...props}>
          <path d="M3 8h9" />
          <path d="m8.5 3.5 4 4-4 4" />
        </svg>
      );
    case "advance":
      return (
        <svg {...props}>
          <path d="M3 8h9" />
          <path d="m8.5 3.5 4 4-4 4" />
        </svg>
      );
  }
}

function ResultFeedbackPanel({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string;
}) {
  const content = value.trim();
  const hasContent = content.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {hasContent ? (
        <>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Review ready
            </span>
          </div>
          <div className={`${coachCardSurfaceClass} rounded-[1.5rem] px-4 py-4`}>
            <p className="text-sm leading-6 text-foreground">{content}</p>
          </div>
        </>
      ) : (
        <div className={`${coachCardSurfaceClass} rounded-[1.5rem] px-4 py-5`}>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-foreground">No review yet</p>
            <p className="text-[13px] leading-5 text-muted">{placeholder}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackModeToggle({
  panelMode,
  onPanelModeChange,
  disabled,
}: {
  panelMode: FeedbackPanelMode;
  onPanelModeChange: (mode: FeedbackPanelMode) => void;
  disabled: boolean;
}) {
  const options: Array<{ value: FeedbackPanelMode; label: string }> = [
    { value: "ai_guide", label: "Guide" },
    { value: "quick_question", label: "Question" },
    { value: "standard", label: "Result" },
  ];

  return (
    <div className={`${coachPillSurfaceClass} inline-grid w-full grid-cols-3 rounded-full p-1`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPanelModeChange(option.value)}
          disabled={disabled}
          aria-pressed={panelMode === option.value}
          className={`h-11 rounded-full px-4 text-sm font-medium transition ${
            panelMode === option.value
              ? coachTabActiveClass
              : "text-muted hover:bg-white/[0.04] hover:text-foreground"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function QuickHelpPanel({
  question,
  answer,
  loading,
  error,
  onQuestionChange,
  onSubmit,
}: {
  question: string;
  answer: string;
  loading: boolean;
  error: string | null;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-3">
      <label htmlFor="quick-help-question" className="sr-only">
        Your question
      </label>

      {/* Input card */}
      <div className={`${coachAnswerSurfaceClass} rounded-[1.5rem] px-4 py-3`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Your question
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="quick-help-question"
            type="text"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            spellCheck={false}
            placeholder="e.g. What edge cases should I handle?"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 ${coachAccentButtonClass}`}
            aria-label="Submit question"
            title="Submit question"
          >
            <PanelIcon name="submit" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Answer area */}
      <div className={`${coachCardSurfaceClass} rounded-[1.5rem] px-4 py-3`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {loading ? "Thinking..." : "Answer"}
        </p>
        {error ? (
          <p className="mt-2 text-xs leading-5 text-rose-200">{error}</p>
        ) : answer ? (
          <p className="mt-2 text-sm leading-6 text-foreground">{answer}</p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">
            {loading ? "" : "Ask a question above and the answer will appear here."}
          </p>
        )}
        {loading && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-white/30" />
          </div>
        )}
      </div>
    </form>
  );
}

function PanelShell({
  panelMode,
  onPanelModeChange,
  description,
  disabled,
  className = "",
  children,
}: {
  panelMode: FeedbackPanelMode;
  onPanelModeChange: (mode: FeedbackPanelMode) => void;
  description: string;
  disabled: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`${coachShellSurfaceClass} flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[2rem] p-5 ${className}`}
    >
      <div className="shrink-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Interview Coach
        </p>
        <p className="sr-only">{description}</p>
      </div>
      <div className="mt-3 shrink-0">
        <FeedbackModeToggle
          panelMode={panelMode}
          onPanelModeChange={onPanelModeChange}
          disabled={disabled}
        />
      </div>
      {/* Scrollable content area — children never overflow the panel */}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className={`${coachCardSurfaceClass} rounded-[1.5rem] p-4`}>
      <p className="text-sm leading-6 text-muted">{message}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-white/70" />
      </div>
    </div>
  );
}

function ErrorCard({ error }: { error: string }) {
  return (
    <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <p className="font-mono text-sm uppercase tracking-[0.18em] text-rose-200">
        Review unavailable
      </p>
      <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
    </div>
  );
}

function GuideStatusIcon({
  verdict,
}: {
  verdict: GuideAnswerVerdict;
}) {
  const isCorrect = verdict === "correct";

  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
        isCorrect
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-rose-400/30 bg-rose-400/10 text-rose-200"
      }`}
    >
      <PanelIcon name={isCorrect ? "check" : "cross"} />
    </span>
  );
}

function GuideSectionCard({
  label,
  aside,
  children,
  className = "",
}: {
  label: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${coachCardSurfaceClass} rounded-[1.45rem] px-4 py-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function GuideCard({
  session,
  stale,
  loading,
  error,
  onSubmit,
  onReveal,
  onAdvance,
}: {
  session: GuideSessionResponse | null;
  stale: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (answer: string) => Promise<void> | void;
  onReveal: () => Promise<void> | void;
  onAdvance: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  useEffect(() => {
    setAnswer(session?.currentAnswer ?? "");
  }, [session?.currentAnswer, session?.currentQuestion, session?.revealedAnswer]);

  // Auto-open modal when revealed answer arrives
  useEffect(() => {
    if (session?.revealedAnswer) {
      setShowAnswerModal(true);
    }
  }, [session?.revealedAnswer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) return;
    await onSubmit(answer.trim());
  }

  async function handleShowAnswer() {
    setShowAnswerModal(true);
    if (!session?.revealedAnswer) {
      await onReveal();
    }
  }

  if (loading && !session) {
    return <LoadingCard message="Preparing your first guide question..." />;
  }

  if (!session) {
    if (error) return <ErrorCard error={error} />;
    return (
      <div className={`${coachCardSurfaceClass} rounded-[1.5rem] p-4`}>
        <p className="text-sm leading-6 text-muted">
          The first guide question will appear here as soon as the page finishes
          loading your draft.
        </p>
      </div>
    );
  }

  const showStatus = Boolean(session.verdict);
  const showEditableForm =
    !session.canAdvance && !session.completed && !session.revealedAnswer;
  const showReveal =
    session.attemptCount > 0 &&
    !session.canAdvance &&
    !session.completed &&
    !loading;
  const inputLocked =
    loading || session.canAdvance || session.completed || !!session.revealedAnswer;
  const feedbackToneClass =
    session.verdict === "correct"
      ? "text-emerald-200"
      : session.verdict
        ? "text-amber-200"
        : "text-muted";
  const nextQuestionButton =
    session.canAdvance && session.queuedNextQuestion ? (
      <button
        type="button"
        onClick={onAdvance}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:brightness-105 ${coachAccentButtonClass}`}
        aria-label="Next guide question"
        title="Next guide question"
      >
        <PanelIcon name="advance" />
      </button>
    ) : null;

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      {stale ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs leading-5 text-amber-100">
          This guide question is based on an older draft.
        </div>
      ) : null}

      {/* Question row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.88rem] leading-[1.55] text-foreground">
          {session.currentQuestion}
        </p>
        {nextQuestionButton}
      </div>

      {/* Answer card — textarea + submit inline */}
      {showEditableForm ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="guide-answer" className="sr-only">Your answer</label>
          <div className={`${coachAnswerSurfaceClass} flex items-start gap-2 rounded-[1.35rem] px-4 py-3`}>
            <textarea
              id="guide-answer"
              rows={3}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              spellCheck={false}
              placeholder="Write your answer here..."
              disabled={inputLocked}
              className="min-w-0 flex-1 resize-none bg-transparent text-sm leading-[1.55] text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || inputLocked || !answer.trim()}
              className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${coachAccentButtonClass}`}
              aria-label="Submit guide answer"
              title="Submit guide answer"
            >
              <PanelIcon name="submit" />
            </button>
          </div>
        </form>
      ) : session.currentAnswer ? (
        <div className={`${coachAnswerSurfaceClass} flex items-center justify-between gap-3 rounded-[1.35rem] px-4 py-3`}>
          <p className="min-w-0 flex-1 text-sm leading-5 text-foreground line-clamp-3">
            {session.currentAnswer}
          </p>
          {showStatus && session.verdict ? (
            <GuideStatusIcon verdict={session.verdict} />
          ) : null}
        </div>
      ) : null}

      {/* Coach note + Show Answer — single compact row */}
      {(session.feedback || showReveal) ? (
        <div className="flex items-start justify-between gap-3">
          {session.feedback ? (
            <p className={`flex-1 text-xs leading-5 ${feedbackToneClass}`}>
              {session.feedback}
            </p>
          ) : <span className="flex-1" />}
          {showReveal ? (
            <button
              type="button"
              onClick={() => void handleShowAnswer()}
              className="shrink-0 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              Show Answer
            </button>
          ) : null}
        </div>
      ) : null}

      {session.completed && !session.canAdvance ? (
        <div className="rounded-[1.2rem] border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs leading-5 text-emerald-100">
          Guide complete. Update your pseudocode or switch to Result.
        </div>
      ) : null}

      {error ? (
        <p className="text-xs leading-5 text-rose-200">{error}</p>
      ) : null}

      {/* Answer modal */}
      {showAnswerModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setShowAnswerModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(44,50,64,0.98)_0%,rgba(29,34,46,0.99)_100%)] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Expected answer
                </p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  {session.currentQuestion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAnswerModal(false)}
                className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-muted transition hover:border-white/20 hover:text-foreground"
                aria-label="Close"
              >
                <PanelIcon name="cross" className="h-4 w-4" />
              </button>
            </div>

            {session.revealedAnswer ? (
              <div className="rounded-[1.35rem] border border-white/10 bg-[rgba(36,42,58,0.8)] px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {session.revealedAnswer}
                </p>
              </div>
            ) : loading ? (
              <div className="rounded-[1.35rem] border border-white/10 bg-[rgba(36,42,58,0.8)] px-5 py-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-white/30" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}


export function FeedbackPanel({
  feedback,
  problemSlug,
  pseudocode,
  resetSignal,
  panelMode,
  onPanelModeChange,
  guideSession,
  guideIsStale,
  guideLoading,
  guideActionLoading,
  guideError,
  onGuideAnswerSubmit,
  onGuideReveal,
  onGuideAdvance,
  reviewLoading,
  error,
  className = "",
}: FeedbackPanelProps) {
  const [quickHelpQuestion, setQuickHelpQuestion] = useState("");
  const [quickHelpAnswer, setQuickHelpAnswer] = useState("");
  const [quickHelpError, setQuickHelpError] = useState<string | null>(null);
  const [quickHelpLoading, setQuickHelpLoading] = useState(false);
  const quickHelpRequestIdRef = useRef(0);

  const isGuideMode = panelMode === "ai_guide";
  const isQuickQuestionMode = panelMode === "quick_question";

  useEffect(() => {
    setQuickHelpAnswer("");
    setQuickHelpError(null);
  }, [panelMode]);

  useEffect(() => {
    quickHelpRequestIdRef.current += 1;
    setQuickHelpQuestion("");
    setQuickHelpAnswer("");
    setQuickHelpError(null);
    setQuickHelpLoading(false);
  }, [resetSignal]);

  async function handleQuickHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quickHelpQuestion.trim()) {
      setQuickHelpError("Type a quick question first.");
      setQuickHelpAnswer("");
      return;
    }

    setQuickHelpLoading(true);
    setQuickHelpError(null);
    const requestId = quickHelpRequestIdRef.current + 1;
    quickHelpRequestIdRef.current = requestId;

    try {
      const response = await fetch("/api/review/quick-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSlug,
          pseudocode,
          mode: "question",
          question: quickHelpQuestion,
        }),
      });

      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (requestId !== quickHelpRequestIdRef.current) {
        return;
      }

      if (!response.ok || !data.answer) {
        throw new Error(data.error || "The assistant could not answer that.");
      }

      setQuickHelpAnswer(data.answer);
    } catch (quickHelpRequestError) {
      if (requestId !== quickHelpRequestIdRef.current) {
        return;
      }

      setQuickHelpAnswer("");
      setQuickHelpError(
        quickHelpRequestError instanceof Error
          ? quickHelpRequestError.message
          : "Something went wrong while getting a quick reply.",
      );
    } finally {
      if (requestId === quickHelpRequestIdRef.current) {
        setQuickHelpLoading(false);
      }
    }
  }

  function handleQuickHelpQuestionChange(value: string) {
    setQuickHelpQuestion(value);
    setQuickHelpAnswer("");
    setQuickHelpError(null);
  }

  const quickHelpPanel = (
    <QuickHelpPanel
      question={quickHelpQuestion}
      answer={quickHelpAnswer}
      loading={quickHelpLoading}
      error={quickHelpError}
      onQuestionChange={handleQuickHelpQuestionChange}
      onSubmit={handleQuickHelpSubmit}
    />
  );

  if (isQuickQuestionMode) {
    return (
      <PanelShell
        panelMode={panelMode}
        onPanelModeChange={onPanelModeChange}
        description="Ask one narrow question."
        disabled={false}
        className={className}
      >
        {quickHelpPanel}
      </PanelShell>
    );
  }

  if (reviewLoading && !isGuideMode) {
    return (
      <PanelShell
        panelMode={panelMode}
        onPanelModeChange={onPanelModeChange}
        description="Compact summary of your latest review."
        disabled
        className={className}
      >
        <LoadingCard message="Reviewing your algorithmic reasoning..." />
      </PanelShell>
    );
  }

  if (isGuideMode) {
    return (
      <PanelShell
        panelMode={panelMode}
        onPanelModeChange={onPanelModeChange}
        description="One focused question at a time."
        disabled={false}
        className={className}
      >
        <GuideCard
          session={guideSession}
          stale={guideIsStale}
          loading={guideLoading || guideActionLoading}
          error={guideError ?? error}
          onSubmit={onGuideAnswerSubmit}
          onReveal={onGuideReveal}
          onAdvance={onGuideAdvance}
        />
      </PanelShell>
    );
  }

  if (error && !feedback) {
    return (
      <PanelShell
        panelMode={panelMode}
        onPanelModeChange={onPanelModeChange}
        description="Compact summary of your latest review."
        disabled={false}
        className={className}
      >
        <ErrorCard error={error} />
      </PanelShell>
    );
  }

  if (!feedback) {
    return (
      <PanelShell
        panelMode={panelMode}
        onPanelModeChange={onPanelModeChange}
        description="Compact summary of your latest review."
        disabled={false}
        className={className}
      >
        <ResultFeedbackPanel
          value=""
          placeholder="Run Check My Logic and your latest review will appear here."
        />
      </PanelShell>
    );
  }

  const resultFeedbackText = buildResultFeedbackText(feedback);

  return (
    <PanelShell
      panelMode={panelMode}
      onPanelModeChange={onPanelModeChange}
      description="Compact summary of your latest review."
      disabled={false}
      className={className}
    >
      <ResultFeedbackPanel
        value={resultFeedbackText}
        placeholder="Run Check My Logic and your latest review will appear here."
      />
    </PanelShell>
  );
}
