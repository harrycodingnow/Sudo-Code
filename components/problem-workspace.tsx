"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type UIEvent,
} from "react";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { FeedbackPanel } from "@/components/feedback-panel";
import { ProblemPane } from "@/components/problem-pane";
import { SpotlightCard } from "@/components/spotlight-card";
import { getProblemSummaries } from "@/lib/problems";
import type {
  FeedbackPanelMode,
  GuideMessage,
  GuideMessageResponse,
  GuideStartResponse,
  Review,
} from "@/lib/review-schema";
import { loadTrackerEntries, markTrackerEntryCompleted } from "@/lib/tracker";
import type { Problem } from "@/types/problem";

type ProblemWorkspaceProps = {
  problem: Problem;
};

type StoredGuideState = {
  draftSnapshot: string | null;
  messages: GuideMessage[];
};

type GuideSeedOptions = {
  replaceTranscript: boolean;
};

function WorkspaceIcon({
  name,
  className = "h-4 w-4",
}: {
  name: "reset" | "back";
  className?: string;
}) {
  switch (name) {
    case "back":
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M10.5 3.5 6 8l4.5 4.5" />
        </svg>
      );
    case "reset":
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M13 3.5v3h-3" />
          <path d="M13 6.5A5.5 5.5 0 1 0 8 13.5a5.4 5.4 0 0 0 3.7-1.4" />
        </svg>
      );
  }
}

async function requestGuideStart(problemSlug: string, draft: string) {
  const response = await fetch("/api/review/guide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "start",
      problemSlug,
      pseudocode: draft,
    }),
  });

  const data = (await response.json()) as {
    message?: GuideStartResponse["message"];
    error?: string;
  };

  if (!response.ok || !data.message) {
    throw new Error(data.error || "The guide could not start a chat.");
  }

  return data.message;
}

async function requestGuideMessage(
  problemSlug: string,
  draft: string,
  messages: GuideMessage[],
) {
  const response = await fetch("/api/review/guide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "message",
      problemSlug,
      pseudocode: draft,
      messages,
    }),
  });

  const data = (await response.json()) as {
    message?: GuideMessageResponse["message"];
    error?: string;
  };

  if (!response.ok || !data.message) {
    throw new Error(data.error || "The guide could not reply right now.");
  }

  return data.message;
}

function readStoredGuideState(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredGuideState>;
    if (!Array.isArray(parsed.messages)) {
      return null;
    }

    const messages = parsed.messages
      .map((message) => {
        if (
          !message ||
          typeof message !== "object" ||
          typeof message.id !== "string" ||
          (message.role !== "assistant" && message.role !== "user") ||
          typeof message.content !== "string"
        ) {
          return null;
        }

        return {
          id: message.id,
          role: message.role,
          content: message.content,
        } satisfies GuideMessage;
      })
      .filter((message): message is GuideMessage => Boolean(message));

    if (!messages.length) {
      return null;
    }

    return {
      draftSnapshot:
        typeof parsed.draftSnapshot === "string" ? parsed.draftSnapshot : null,
      messages,
    };
  } catch {
    return null;
  }
}

const workspacePanelSurfaceClass = "linear-shell";
const workspaceAccentButtonClass = "linear-accent-button";

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const problemSummaries = useMemo(() => getProblemSummaries(), []);
  const storageKey = useMemo(
    () => `sudocode:draft:${problem.slug}`,
    [problem.slug],
  );
  const guideStorageKey = useMemo(
    () => `sudocode:guide:${problem.slug}`,
    [problem.slug],
  );
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const guideConversationVersionRef = useRef(0);
  const [pseudocode, setPseudocode] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [feedback, setFeedback] = useState<Review | null>(null);
  const [guideMessages, setGuideMessages] = useState<GuideMessage[]>([]);
  const [guideDraftSnapshot, setGuideDraftSnapshot] = useState<string | null>(
    null,
  );
  const [guideStateReady, setGuideStateReady] = useState(false);
  const [panelMode, setPanelMode] = useState<FeedbackPanelMode>("ai_guide");
  const [standardError, setStandardError] = useState<string | null>(null);
  const [guideLoadError, setGuideLoadError] = useState<string | null>(null);
  const [guideSendError, setGuideSendError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [guideStartLoading, setGuideStartLoading] = useState(false);
  const [guideSendLoading, setGuideSendLoading] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);
  const [feedbackResetSignal, setFeedbackResetSignal] = useState(0);
  const [editorViewportLineCount, setEditorViewportLineCount] = useState(12);
  const contentLineCount = useMemo(
    () => pseudocode.split("\n").length,
    [pseudocode],
  );
  const lineCount = useMemo(
    () => Math.max(editorViewportLineCount, contentLineCount),
    [contentLineCount, editorViewportLineCount],
  );
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );
  const guideIsStale = Boolean(
    guideStateReady &&
      guideDraftSnapshot !== null &&
      guideDraftSnapshot !== pseudocode &&
      guideMessages.length > 0,
  );
  const workspaceActionDisabled =
    reviewLoading || guideStartLoading || guideSendLoading;

  const startGuideConversation = useCallback(
    async (
      draft: string,
      { replaceTranscript }: GuideSeedOptions,
    ) => {
      const requestVersion = ++guideConversationVersionRef.current;
      setGuideStartLoading(true);
      setGuideLoadError(null);
      setGuideSendError(null);

      if (replaceTranscript) {
        setGuideMessages([]);
        setGuideDraftSnapshot(null);
        setGuideStateReady(false);
      }

      try {
        const message = await requestGuideStart(problem.slug, draft);

        if (requestVersion !== guideConversationVersionRef.current) {
          return;
        }

        setGuideMessages([message]);
        setGuideDraftSnapshot(draft);
        setGuideStateReady(true);
      } catch (guideStartRequestError) {
        if (requestVersion !== guideConversationVersionRef.current) {
          return;
        }

        setGuideLoadError(
          guideStartRequestError instanceof Error
            ? guideStartRequestError.message
            : "Something went wrong while starting the guide.",
        );
      } finally {
        if (requestVersion === guideConversationVersionRef.current) {
          setGuideStartLoading(false);
        }
      }
    },
    [problem.slug],
  );

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(storageKey);
    const initialDraft =
      savedDraft && savedDraft !== problem.starterPseudocode ? savedDraft : "";
    const savedGuideState = readStoredGuideState(guideStorageKey);

    guideConversationVersionRef.current += 1;

    setPseudocode(initialDraft);
    setDraftReady(true);
    setFeedback(null);
    setPanelMode("ai_guide");
    setStandardError(null);
    setGuideLoadError(null);
    setGuideSendError(null);
    setReviewLoading(false);
    setGuideSendLoading(false);
    setGuideStartLoading(false);
    setFeedbackResetSignal(0);

    if (savedGuideState) {
      setGuideMessages(savedGuideState.messages);
      setGuideDraftSnapshot(savedGuideState.draftSnapshot ?? initialDraft);
      setGuideStateReady(true);
      return;
    }

    void startGuideConversation(initialDraft, { replaceTranscript: true });
  }, [
    problem.slug,
    problem.starterPseudocode,
    storageKey,
    guideStorageKey,
    startGuideConversation,
  ]);

  useEffect(() => {
    const trackerEntries = loadTrackerEntries(problemSummaries);
    setIsMarkedComplete(
      trackerEntries[problem.slug]?.progress === "Completed",
    );
  }, [problem.slug, problemSummaries]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    window.localStorage.setItem(storageKey, pseudocode);
  }, [draftReady, pseudocode, storageKey]);

  useEffect(() => {
    if (!guideStateReady) {
      return;
    }

    window.localStorage.setItem(
      guideStorageKey,
      JSON.stringify({
        draftSnapshot: guideDraftSnapshot,
        messages: guideMessages,
      }),
    );
  }, [guideDraftSnapshot, guideMessages, guideStateReady, guideStorageKey]);

  useEffect(() => {
    const textarea = editorRef.current;
    if (!textarea) {
      return;
    }
    const editorElement = textarea;

    function updateEditorViewportLineCount() {
      const computedStyle = window.getComputedStyle(editorElement);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight);

      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        return;
      }

      const verticalPadding =
        Number.parseFloat(computedStyle.paddingTop) +
        Number.parseFloat(computedStyle.paddingBottom);
      const visibleHeight = Math.max(
        editorElement.clientHeight - verticalPadding,
        lineHeight,
      );
      const nextLineCount = Math.max(1, Math.floor(visibleHeight / lineHeight));

      setEditorViewportLineCount((current) =>
        current === nextLineCount ? current : nextLineCount,
      );
    }

    updateEditorViewportLineCount();

    const resizeObserver = new ResizeObserver(() => {
      updateEditorViewportLineCount();
    });

    resizeObserver.observe(editorElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  async function handleStandardReview(draft: string) {
    if (!draft.trim()) {
      setStandardError(
        "Add some pseudocode first so the reviewer has something to assess.",
      );
      setFeedback(null);
      return;
    }

    setReviewLoading(true);
    setStandardError(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSlug: problem.slug,
          pseudocode: draft,
          reviewMode: "standard",
        }),
      });

      const data = (await response.json()) as {
        feedback?: Review;
        error?: string;
      };

      if (!response.ok || !data.feedback) {
        throw new Error(
          data.error || "The reviewer could not score that attempt.",
        );
      }

      setFeedback(data.feedback);
    } catch (reviewError) {
      setFeedback(null);
      setStandardError(
        reviewError instanceof Error
          ? reviewError.message
          : "Something went wrong while reviewing your logic.",
      );
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleReview(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const currentDraft = pseudocode;

    setPanelMode("standard");
    setGuideSendError(null);

    await handleStandardReview(currentDraft);
  }

  function handleResetWorkspace() {
    if (workspaceActionDisabled) {
      return;
    }

    guideConversationVersionRef.current += 1;

    if (draftReady) {
      window.localStorage.removeItem(storageKey);
    }

    window.localStorage.removeItem(guideStorageKey);

    setPseudocode("");
    setFeedback(null);
    setPanelMode("ai_guide");
    setStandardError(null);
    setGuideLoadError(null);
    setGuideSendError(null);
    setGuideMessages([]);
    setGuideDraftSnapshot(null);
    setGuideStateReady(false);
    setFeedbackResetSignal((current) => current + 1);
    void startGuideConversation("", { replaceTranscript: true });
  }

  function handleMarkAsComplete() {
    if (workspaceActionDisabled) {
      return;
    }

    const nextEntry = markTrackerEntryCompleted(problemSummaries, problem.slug);

    if (nextEntry?.progress === "Completed") {
      setIsMarkedComplete(true);
    }
  }

  function handleGuideClearHistory() {
    if (guideStartLoading || guideSendLoading) {
      return;
    }

    guideConversationVersionRef.current += 1;
    window.localStorage.removeItem(guideStorageKey);

    setPanelMode("ai_guide");
    setGuideStartLoading(true);
    setGuideLoadError(null);
    setGuideSendError(null);
    setGuideMessages([]);
    setGuideDraftSnapshot(null);
    setGuideStateReady(false);
    setFeedbackResetSignal((current) => current + 1);

    void startGuideConversation(pseudocode, { replaceTranscript: true });
  }

  async function handleGuideSendMessage(message: string) {
    if (!guideStateReady || !message.trim() || guideSendLoading) {
      return;
    }

    const currentDraft = guideDraftSnapshot ?? pseudocode;
    const nextUserMessage: GuideMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message.trim(),
    };
    const nextMessages = [...guideMessages, nextUserMessage];
    const requestVersion = guideConversationVersionRef.current;

    setGuideSendLoading(true);
    setGuideSendError(null);
    setGuideMessages(nextMessages);

    try {
      const assistantMessage = await requestGuideMessage(
        problem.slug,
        currentDraft,
        nextMessages,
      );

      if (requestVersion !== guideConversationVersionRef.current) {
        return;
      }

      setGuideMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (guideMessageError) {
      if (requestVersion !== guideConversationVersionRef.current) {
        return;
      }

      setGuideSendError(
        guideMessageError instanceof Error
          ? guideMessageError.message
          : "Something went wrong while sending that message.",
      );
    } finally {
      if (requestVersion === guideConversationVersionRef.current) {
        setGuideSendLoading(false);
      }
    }
  }

  function handleEditorScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (!lineNumberRef.current) {
      return;
    }

    lineNumberRef.current.scrollTop = event.currentTarget.scrollTop;
  }

  const guidePanelError = guideSendError ?? guideLoadError;

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <header className="flex flex-col gap-3">
        <Link
          href="/problems"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <WorkspaceIcon name="back" className="h-4 w-4" />
          Back to problem list
        </Link>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="linear-pill rounded-full px-3 py-1.5 text-sm text-foreground">
                {problem.category}
              </span>
          </div>

          <h1 className="linear-heading min-w-0 text-[2rem] font-semibold tracking-tight sm:text-[2.4rem] xl:text-center xl:text-[2.1rem]">
            {problem.title}
          </h1>

          <div className="flex items-center gap-2 xl:justify-self-end xl:shrink-0">
            <button
              type="submit"
              form="problem-review-form"
              disabled={reviewLoading || guideSendLoading}
              className={`rounded-2xl px-5 py-3 text-sm font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${workspaceAccentButtonClass}`}
            >
              {reviewLoading ? "Running..." : "Check logic"}
            </button>
            <button
              type="button"
              onClick={handleResetWorkspace}
              disabled={workspaceActionDisabled}
              className="linear-soft-button inline-flex h-12 w-12 items-center justify-center rounded-2xl text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Reset workspace"
              title="Reset workspace"
            >
              <WorkspaceIcon name="reset" />
            </button>
            <button
              type="button"
              onClick={handleMarkAsComplete}
              disabled={workspaceActionDisabled}
              className={`inline-flex h-12 items-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isMarkedComplete
                  ? "border border-emerald-400/30 bg-emerald-500/12 text-emerald-200 shadow-[0_12px_24px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-emerald-300/40 hover:bg-emerald-500/16"
                  : "linear-soft-button text-foreground"
              }`}
              aria-label="Mark problem as complete"
              title="Mark problem as complete"
            >
              {isMarkedComplete ? "Completed" : "Mark as complete"}
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:grid-rows-none">
        <div className="grid min-h-0 gap-4 xl:h-full xl:grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ProblemPane problem={problem} />

          <SpotlightCard
            as="form"
            id="problem-review-form"
            onSubmit={handleReview}
            className={`${workspacePanelSurfaceClass} flex h-full flex-col rounded-[2rem] p-4 xl:min-h-0`}
          >
            <div className="relative z-10 flex items-center justify-between gap-3 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Pseudocode draft
                </p>
                <p className="mt-1 text-sm text-muted">
                  Explain the algorithm step by step before you optimize the
                  final answer.
                </p>
              </div>
              <span className="linear-pill rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {contentLineCount} lines
              </span>
            </div>

            <label htmlFor="pseudocode-editor" className="sr-only">
              Pseudocode editor
            </label>
            <div className="linear-editor-surface flex min-h-[18rem] flex-1 overflow-hidden rounded-[1.65rem] transition-colors focus-within:border-[rgba(34,199,184,0.38)] xl:min-h-0">
              <div
                ref={lineNumberRef}
                aria-hidden="true"
                className="min-w-[3.75rem] overflow-hidden border-r border-white/8 bg-white/5 px-3 py-3 font-mono text-[13px] leading-[1.6] text-muted"
              >
                {lineNumbers.map((lineNumber) => (
                  <span key={lineNumber} className="block text-right">
                    {lineNumber}
                  </span>
                ))}
              </div>

              <textarea
                ref={editorRef}
                id="pseudocode-editor"
                rows={editorViewportLineCount}
                value={pseudocode}
                onChange={(event) => setPseudocode(event.target.value)}
                onScroll={handleEditorScroll}
                placeholder="Describe your algorithm step by step..."
                spellCheck={false}
                wrap="soft"
                className="min-h-[18rem] w-full flex-1 resize-none overflow-y-auto overflow-x-hidden bg-transparent px-4 py-3 font-mono text-[13px] leading-[1.72] text-foreground outline-none placeholder:text-muted [overflow-wrap:anywhere] xl:min-h-0"
              />
            </div>
          </SpotlightCard>
        </div>

        <div className="min-h-0 h-full">
          <FeedbackPanel
            feedback={feedback}
            resetSignal={feedbackResetSignal}
            panelMode={panelMode}
            onPanelModeChange={setPanelMode}
            guideMessages={guideMessages}
            guideIsStale={guideIsStale}
            guideLoading={guideStartLoading}
            guideActionLoading={guideSendLoading}
            guideError={guidePanelError}
            onGuideSendMessage={handleGuideSendMessage}
            onGuideClearHistory={handleGuideClearHistory}
            reviewLoading={reviewLoading}
            error={panelMode === "ai_guide" ? guidePanelError : standardError}
            className="h-full min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
