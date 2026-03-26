"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { SpotlightCard } from "@/components/spotlight-card";

import type {
  FeedbackPanelMode,
  GuideMessage,
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
  resetSignal: number;
  panelMode: FeedbackPanelMode;
  onPanelModeChange: (mode: FeedbackPanelMode) => void;
  guideMessages: GuideMessage[];
  guideIsStale: boolean;
  guideLoading: boolean;
  guideActionLoading: boolean;
  guideError: string | null;
  onGuideSendMessage: (message: string) => Promise<void> | void;
  onGuideClearHistory: () => Promise<void> | void;
  reviewLoading: boolean;
  error: string | null;
  className?: string;
};

function buildResultFeedbackText(feedback: Review) {
  const verdict = verdictCopy[feedback.verdict].label;
  const sentence1 = `${verdict}. ${feedback.summary.trim()}`;
  const topIssue = [
    ...feedback.logic_issues,
    ...feedback.missing_steps,
    ...feedback.improvement_suggestions,
  ][0];
  const sentence2 = topIssue ? topIssue.trim() : null;
  const sentence3 = `Time: ${feedback.time_complexity} · Space: ${feedback.space_complexity}.`;

  return [sentence1, sentence2, sentence3]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");
}

const coachShellSurfaceClass = "linear-shell";
const coachCardSurfaceClass = "linear-card";
const coachPillSurfaceClass = "linear-pill";
const coachTabActiveClass = "linear-tab-active";
const coachAccentButtonClass = "linear-accent-button";

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
    { value: "standard", label: "Result" },
  ];

  return (
    <div className={`${coachPillSurfaceClass} inline-grid w-full grid-cols-2 rounded-full p-1`}>
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
    <SpotlightCard
      as="section"
      className={`${coachShellSurfaceClass} flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[2rem] p-5 ${className}`}
    >
      <div className="relative z-10 shrink-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Interview Coach
        </p>
        <p className="sr-only">{description}</p>
      </div>
      <div className="relative z-10 mt-3 shrink-0">
        <FeedbackModeToggle
          panelMode={panelMode}
          onPanelModeChange={onPanelModeChange}
          disabled={disabled}
        />
      </div>
      <div className="relative z-10 mt-4 flex min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </SpotlightCard>
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <div className={`${coachCardSurfaceClass} rounded-[1.5rem] p-4`}>
      <p className="text-sm leading-6 text-muted">{message}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/55 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
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

function GuideChatBubble({
  role,
  content,
}: {
  role: GuideMessage["role"];
  content: string;
}) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-[1.35rem] px-4 py-3 ${
          isAssistant
            ? `${coachCardSurfaceClass} border border-white/5`
            : "border border-white/10 bg-white/[0.06]"
        }`}
      >
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {isAssistant ? "Coach" : "You"}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
          {content}
        </p>
      </div>
    </div>
  );
}

function GuideChatCard({
  messages,
  stale,
  loading,
  error,
  resetSignal,
  onSend,
  onClear,
}: {
  messages: GuideMessage[];
  stale: boolean;
  loading: boolean;
  error: string | null;
  resetSignal: number;
  onSend: (message: string) => Promise<void> | void;
  onClear: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    setDraft("");
  }, [resetSignal]);

  useEffect(() => {
    if (!isAtBottomRef.current) {
      return;
    }

    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function handleTranscriptScroll() {
    const transcript = transcriptRef.current;
    if (!transcript) {
      return;
    }

    const distanceFromBottom =
      transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight;
    isAtBottomRef.current = distanceFromBottom < 24;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text || loading) {
      return;
    }

    setDraft("");
    await onSend(text);
  }

  if (loading && messages.length === 0) {
    return <LoadingCard message="Starting your guide chat..." />;
  }

  if (!messages.length && error) {
    return <ErrorCard error={error} />;
  }

  return (
    <div className="grid h-full min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Chat history
        </p>
        <div className="flex items-center gap-2">
          {stale ? (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-100">
              Based on older draft
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void onClear()}
            disabled={loading}
            className="linear-soft-button rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear chat
          </button>
        </div>
      </div>

      <div
        className={`${coachCardSurfaceClass} flex min-h-0 flex-1 overflow-hidden rounded-[1.5rem]`}
      >
        <div
          ref={transcriptRef}
          onScroll={handleTranscriptScroll}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3 overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
        >
          {messages.length ? (
            messages.map((message) => (
              <GuideChatBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))
          ) : (
            <div className="flex h-full min-h-[8rem] items-center justify-center px-4 text-center text-sm leading-6 text-muted">
              Your guide conversation will appear here.
            </div>
          )}

          {loading ? (
            <div className="flex justify-start">
              <div className={`${coachCardSurfaceClass} rounded-[1.35rem] px-4 py-3`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Coach
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/45 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/35 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/25" />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-2.5">
        <label htmlFor="guide-message" className="sr-only">
          Message the coach
        </label>
        <div className={`${coachCardSurfaceClass} flex items-end gap-2 rounded-[1.35rem] px-4 py-3`}>
          <textarea
            id="guide-message"
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) {
                return;
              }

              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }}
            spellCheck={false}
            placeholder="Ask for the next step, justify a choice, or challenge your approach..."
            disabled={loading}
            className="min-w-0 flex-1 resize-none bg-transparent text-sm leading-[1.55] text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !draft.trim()}
            className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-medium transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${coachAccentButtonClass}`}
          >
            Send
          </button>
        </div>
        {error ? (
          <p className="text-xs leading-5 text-rose-200">{error}</p>
        ) : null}
      </form>
    </div>
  );
}

export function FeedbackPanel({
  feedback,
  resetSignal,
  panelMode,
  onPanelModeChange,
  guideMessages,
  guideIsStale,
  guideLoading,
  guideActionLoading,
  guideError,
  onGuideSendMessage,
  onGuideClearHistory,
  reviewLoading,
  error,
  className = "",
}: FeedbackPanelProps) {
  const isGuideMode = panelMode === "ai_guide";

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
        description="Chat with the guide and keep the full transcript visible."
        disabled={false}
        className={className}
      >
        <GuideChatCard
          messages={guideMessages}
          stale={guideIsStale}
          loading={guideLoading || guideActionLoading}
          error={guideError ?? error}
          resetSignal={resetSignal}
          onSend={onGuideSendMessage}
          onClear={onGuideClearHistory}
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
