"use client";

import { useEffect, useState, type FormEvent } from "react";

import type {
  FeedbackPanelMode,
  Review,
  ReviewMode,
  ReviewVerdict,
} from "@/lib/review-schema";

const verdictCopy: Record<ReviewVerdict, { label: string; tone: string }> = {
  correct: {
    label: "Logic looks solid",
    tone: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  partially_correct: {
    label: "Close, but missing pieces",
    tone: "border border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  incorrect: {
    label: "Approach needs revision",
    tone: "border border-rose-400/20 bg-rose-400/10 text-rose-200",
  },
};

type FeedbackPanelProps = {
  feedback: Review | null;
  problemSlug: string;
  pseudocode: string;
  panelMode: FeedbackPanelMode;
  feedbackMode: ReviewMode | null;
  onPanelModeChange: (mode: FeedbackPanelMode) => void;
  loading: boolean;
  error: string | null;
  className?: string;
};

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="rounded-lg border border-border bg-surface px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">
          Nothing notable here.
        </p>
      )}
    </div>
  );
}

function GuideTextBox({ content }: { content: string }) {
  return (
    <div className="h-full min-h-0 overflow-y-auto rounded-xl border border-border bg-background px-3 py-3 font-mono text-[13px] leading-6 whitespace-pre-wrap text-foreground">
      {content}
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
    <div className="grid grid-cols-3 rounded-xl border border-border bg-background p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPanelModeChange(option.value)}
          disabled={disabled}
          aria-pressed={panelMode === option.value}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            panelMode === option.value
              ? "bg-white text-black"
              : "text-muted hover:text-foreground"
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
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-background p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Quick question
        </p>
        <p className="text-xs text-muted">One-line reply</p>
      </div>

      <div className="mt-3 grid gap-3">
        <div>
          <label
            htmlFor="quick-help-question"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            Your question
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="quick-help-question"
              type="text"
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="What should I check next?"
              className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-white"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="h-10 rounded-lg bg-white px-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="quick-help-answer"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            Answer
          </label>
          <input
            id="quick-help-answer"
            type="text"
            readOnly
            value={answer}
            placeholder={loading ? "Thinking..." : "AI reply shows here."}
            className="mt-2 h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted"
          />
          {error ? (
            <p className="mt-2 text-xs leading-5 text-rose-200">{error}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export function FeedbackPanel({
  feedback,
  problemSlug,
  pseudocode,
  panelMode,
  feedbackMode,
  onPanelModeChange,
  loading,
  error,
  className = "",
}: FeedbackPanelProps) {
  const [quickHelpQuestion, setQuickHelpQuestion] = useState("");
  const [quickHelpAnswer, setQuickHelpAnswer] = useState("");
  const [quickHelpError, setQuickHelpError] = useState<string | null>(null);
  const [quickHelpLoading, setQuickHelpLoading] = useState(false);

  const isGuideMode = panelMode === "ai_guide";
  const isQuickQuestionMode = panelMode === "quick_question";
  const isQuickHelpMode = isQuickQuestionMode;
  const currentReviewMode: ReviewMode =
    panelMode === "standard" ? "standard" : "ai_guide";
  const hasStaleFeedback = Boolean(
    !isQuickHelpMode &&
    feedback &&
    feedbackMode &&
    feedbackMode !== currentReviewMode,
  );
  const guideText = feedback
    ? [
        feedback.summary,
        ...feedback.logic_issues,
        ...feedback.missing_steps,
        ...feedback.improvement_suggestions,
        ...feedback.edge_cases,
        ...feedback.interviewer_followup,
      ]
        .filter((item) => item.trim().length > 0)
        .join("\n\n")
    : "Write your pseudocode, then click Check My Logic.\n\nAI Guide will respond here with the next question, a small nudge, or a trace-through to help you keep going without giving the full answer away.";

  useEffect(() => {
    setQuickHelpAnswer("");
    setQuickHelpError(null);
  }, [panelMode]);

  async function handleQuickHelpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!quickHelpQuestion.trim()) {
      setQuickHelpError("Type a quick question first.");
      setQuickHelpAnswer("");
      return;
    }

    setQuickHelpLoading(true);
    setQuickHelpError(null);

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

      if (!response.ok || !data.answer) {
        throw new Error(data.error || "The assistant could not answer that.");
      }

      setQuickHelpAnswer(data.answer);
    } catch (quickHelpRequestError) {
      setQuickHelpAnswer("");
      setQuickHelpError(
        quickHelpRequestError instanceof Error
          ? quickHelpRequestError.message
          : "Something went wrong while getting a quick reply.",
      );
    } finally {
      setQuickHelpLoading(false);
    }
  }

  function handleQuickHelpQuestionChange(value: string) {
    setQuickHelpQuestion(value);
    setQuickHelpAnswer("");
    setQuickHelpError(null);
  }

  const quickHelpPanel = isQuickHelpMode ? (
    <QuickHelpPanel
      question={quickHelpQuestion}
      answer={quickHelpAnswer}
      loading={quickHelpLoading}
      error={quickHelpError}
      onQuestionChange={handleQuickHelpQuestionChange}
      onSubmit={handleQuickHelpSubmit}
    />
  ) : null;

  const modeDescription = isQuickHelpMode
    ? "Ask one narrow question."
    : isGuideMode
      ? "Guide mode keeps the answer with you and gives the next nudge."
      : "Direct review of your current logic, gaps, and complexity tradeoffs.";

  if (loading) {
    return (
      <section
        className={`flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
              Interview coach
            </p>
            <p className="mt-1 max-w-xl text-sm leading-5 text-muted">
              {modeDescription}
            </p>
          </div>
          <FeedbackModeToggle
            panelMode={panelMode}
            onPanelModeChange={onPanelModeChange}
            disabled
          />
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted">
          <p>
            {currentReviewMode === "ai_guide"
              ? "Preparing your next guided step..."
              : "Reviewing your algorithmic reasoning..."}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-white/70" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
              Feedback
            </p>
            <p className="mt-1 max-w-xl text-sm leading-5 text-muted">
              {isQuickHelpMode
                ? "Use one-line prompts for a fast nudge without leaving the panel."
                : isGuideMode
                  ? "Guide mode stays collaborative and keeps the answer with you."
                  : "Standard feedback scores the logic directly and highlights the main gaps."}
            </p>
          </div>
          <FeedbackModeToggle
            panelMode={panelMode}
            onPanelModeChange={onPanelModeChange}
            disabled={false}
          />
        </div>
        <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4">
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-rose-200">
            Review unavailable
          </p>
          <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
        </div>
        {quickHelpPanel ? <div className="mt-4">{quickHelpPanel}</div> : null}
      </section>
    );
  }

  if (!feedback) {
    return (
      <section
        className={`flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
              Feedback
            </p>
            <p className="mt-1 max-w-xl text-sm leading-5 text-muted">
              {isQuickHelpMode
                ? "Ask one focused question."
                : isGuideMode
                  ? "Guide mode gives one focused nudge at a time."
                  : "Standard feedback."}
            </p>
          </div>
          <FeedbackModeToggle
            panelMode={panelMode}
            onPanelModeChange={onPanelModeChange}
            disabled={false}
          />
        </div>
        {isQuickHelpMode ? (
          <div className="mt-4">{quickHelpPanel}</div>
        ) : isGuideMode ? (
          <div className="mt-4 min-h-0 flex-1">
            <GuideTextBox content={guideText} />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Correctness
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Whether the overall solution is correct, partially correct, or
                off track.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Algorithm choice / approach
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Whether the data structure, traversal, and step-by-step plan
                make sense.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Time & space complexity
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Time and space tradeoffs for the approach you described.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Edge case handling
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Inputs and corner cases your current pseudocode still needs to
                cover.
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }

  const verdict = verdictCopy[feedback.verdict];
  const approachItems = [
    ...feedback.logic_issues,
    ...feedback.missing_steps,
    ...feedback.improvement_suggestions,
  ];

  return (
    <section
      className={`flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
            Interview coach
          </p>
          <p className="mt-1 max-w-xl text-sm leading-5 text-muted">
            {isQuickHelpMode
              ? "Ask one narrow question."
              : isGuideMode
                ? "Guide mode keeps the answer with you and gives the next nudge."
                : "Standard feedback gives a direct read on correctness, gaps, and follow-up questions."}
          </p>
        </div>
        <FeedbackModeToggle
          panelMode={panelMode}
          onPanelModeChange={onPanelModeChange}
          disabled={false}
        />
      </div>

      {hasStaleFeedback ? (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
          Review mode changed to {isGuideMode ? "Guide" : "Standard"}. Run{" "}
          <span className="font-semibold">Check My Logic</span> again to refresh
          this feedback in the selected mode.
        </div>
      ) : null}

      {isQuickHelpMode ? (
        <div className="mt-4">{quickHelpPanel}</div>
      ) : isGuideMode ? (
        <div className="mt-4 min-h-0 flex-1">
          <GuideTextBox content={guideText} />
        </div>
      ) : (
        <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className={`rounded-xl p-4 ${verdict.tone}`}>
            <p className="font-mono text-xs uppercase tracking-[0.18em]">
              Correctness
            </p>
            <p className="mt-2 text-sm leading-6 opacity-90">{verdict.label}</p>
            <p className="mt-2 text-base leading-7">{feedback.summary}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FeedbackList
              title="Algorithm choice / approach"
              items={approachItems}
            />
            <FeedbackList
              title="Edge case handling"
              items={feedback.edge_cases}
            />
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Time & space complexity
            </h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <h5 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                  Time complexity
                </h5>
                <p className="mt-3 font-mono text-sm text-foreground">
                  {feedback.time_complexity}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <h5 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                  Space complexity
                </h5>
                <p className="mt-3 font-mono text-sm text-foreground">
                  {feedback.space_complexity}
                </p>
              </div>
            </div>
          </div>

          <FeedbackList
            title="Interviewer follow-up"
            items={feedback.interviewer_followup}
          />
        </div>
      )}
    </section>
  );
}
