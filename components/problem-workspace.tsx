"use client";

import Link from "next/link";
import {
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
import type {
  FeedbackPanelMode,
  GuideSessionResponse,
  Review,
} from "@/lib/review-schema";
import type { Problem } from "@/types/problem";

type ProblemWorkspaceProps = {
  problem: Problem;
};

type SeedGuideOptions = {
  clearSession: boolean;
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

async function requestGuideSeed(problemSlug: string, draft: string) {
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
    session?: GuideSessionResponse;
    error?: string;
  };

  if (!response.ok || !data.session) {
    throw new Error(data.error || "The guide could not start a question flow.");
  }

  return data.session;
}

const workspacePanelSurfaceClass =
  "border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

const workspaceCardSurfaceClass =
  "border border-white/10 bg-[linear-gradient(180deg,rgba(68,74,92,0.72)_0%,rgba(55,61,78,0.76)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

const workspaceAccentButtonClass =
  "bg-[linear-gradient(180deg,#86d39b_0%,#6dbf84_100%)] text-[#142018] shadow-[0_14px_28px_rgba(63,118,84,0.3)]";

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const storageKey = useMemo(
    () => `sudocode:draft:${problem.slug}`,
    [problem.slug],
  );
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const guideSeedRequestIdRef = useRef(0);
  const [pseudocode, setPseudocode] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [feedback, setFeedback] = useState<Review | null>(null);
  const [guideSession, setGuideSession] = useState<GuideSessionResponse | null>(
    null,
  );
  const [guideDraftSnapshot, setGuideDraftSnapshot] = useState<string | null>(
    null,
  );
  const [panelMode, setPanelMode] = useState<FeedbackPanelMode>("ai_guide");
  const [standardError, setStandardError] = useState<string | null>(null);
  const [guideSeedError, setGuideSeedError] = useState<string | null>(null);
  const [guideActionError, setGuideActionError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [guideSeedLoading, setGuideSeedLoading] = useState(false);
  const [guideActionLoading, setGuideActionLoading] = useState(false);
  const [feedbackResetSignal, setFeedbackResetSignal] = useState(0);
  const lineCount = useMemo(
    () => Math.max(12, pseudocode.split("\n").length),
    [pseudocode],
  );
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );
  const guideIsStale = Boolean(
    guideSession &&
      guideDraftSnapshot !== null &&
      guideDraftSnapshot !== pseudocode,
  );

  async function seedGuideSession(
    draft: string,
    { clearSession }: SeedGuideOptions,
  ) {
    const requestId = guideSeedRequestIdRef.current + 1;
    guideSeedRequestIdRef.current = requestId;

    setGuideSeedLoading(true);
    setGuideSeedError(null);

    if (clearSession) {
      setGuideSession(null);
      setGuideDraftSnapshot(null);
    }

    try {
      const session = await requestGuideSeed(problem.slug, draft);

      if (requestId !== guideSeedRequestIdRef.current) {
        return;
      }

      setGuideSession(session);
      setGuideDraftSnapshot(draft);
    } catch (guideSeedRequestError) {
      if (requestId !== guideSeedRequestIdRef.current) {
        return;
      }

      if (clearSession) {
        setGuideSession(null);
        setGuideDraftSnapshot(null);
      }

      setGuideSeedError(
        guideSeedRequestError instanceof Error
          ? guideSeedRequestError.message
          : "Something went wrong while starting the guide.",
      );
    } finally {
      if (requestId === guideSeedRequestIdRef.current) {
        setGuideSeedLoading(false);
      }
    }
  }

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(storageKey);
    const initialDraft =
      savedDraft && savedDraft !== problem.starterPseudocode ? savedDraft : "";
    const requestId = guideSeedRequestIdRef.current + 1;

    guideSeedRequestIdRef.current = requestId;

    setPseudocode(initialDraft);
    setDraftReady(true);
    setFeedback(null);
    setPanelMode("ai_guide");
    setStandardError(null);
    setGuideSeedError(null);
    setGuideActionError(null);
    setReviewLoading(false);
    setGuideActionLoading(false);
    setGuideSeedLoading(true);
    setGuideSession(null);
    setGuideDraftSnapshot(null);

    async function loadInitialGuideQuestion() {
      try {
        const session = await requestGuideSeed(problem.slug, initialDraft);

        if (requestId !== guideSeedRequestIdRef.current) {
          return;
        }

        setGuideSession(session);
        setGuideDraftSnapshot(initialDraft);
      } catch (guideSeedRequestError) {
        if (requestId !== guideSeedRequestIdRef.current) {
          return;
        }

        setGuideSeedError(
          guideSeedRequestError instanceof Error
            ? guideSeedRequestError.message
            : "Something went wrong while starting the guide.",
        );
      } finally {
        if (requestId === guideSeedRequestIdRef.current) {
          setGuideSeedLoading(false);
        }
      }
    }

    void loadInitialGuideQuestion();
  }, [problem.slug, problem.starterPseudocode, storageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    window.localStorage.setItem(storageKey, pseudocode);
  }, [draftReady, pseudocode, storageKey]);

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
        throw new Error(data.error || "The reviewer could not score that attempt.");
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

    if (panelMode === "quick_question") {
      return;
    }

    const currentDraft = pseudocode;

    setPanelMode("standard");
    setGuideActionError(null);
    void seedGuideSession(currentDraft, { clearSession: false });

    await handleStandardReview(currentDraft);
  }

  function handleResetWorkspace() {
    if (reviewLoading || guideSeedLoading || guideActionLoading) {
      return;
    }

    guideSeedRequestIdRef.current += 1;

    if (draftReady) {
      window.localStorage.removeItem(storageKey);
    }

    setPseudocode("");
    setFeedback(null);
    setPanelMode("ai_guide");
    setStandardError(null);
    setGuideSeedError(null);
    setGuideActionError(null);
    setGuideSession(null);
    setGuideDraftSnapshot(null);
    setFeedbackResetSignal((current) => current + 1);
    void seedGuideSession("", { clearSession: true });
  }

  async function handleGuideAnswerSubmit(answer: string) {
    if (
      !guideSession ||
      guideSession.canAdvance ||
      guideSession.completed ||
      guideSession.revealedAnswer
    ) {
      return;
    }

    setGuideActionLoading(true);
    setGuideActionError(null);

    try {
      const response = await fetch("/api/review/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "answer",
          problemSlug: problem.slug,
          pseudocode: guideDraftSnapshot ?? pseudocode,
          session: guideSession,
          answer,
        }),
      });

      const data = (await response.json()) as {
        session?: GuideSessionResponse;
        error?: string;
      };

      if (!response.ok || !data.session) {
        throw new Error(
          data.error || "The guide could not score that answer right now.",
        );
      }

      setGuideSession(data.session);
    } catch (guideAnswerError) {
      setGuideActionError(
        guideAnswerError instanceof Error
          ? guideAnswerError.message
          : "Something went wrong while scoring that answer.",
      );
    } finally {
      setGuideActionLoading(false);
    }
  }

  async function handleGuideReveal() {
    if (
      !guideSession ||
      guideSession.attemptCount < 1 ||
      guideSession.canAdvance ||
      guideSession.completed ||
      guideSession.revealedAnswer
    ) {
      return;
    }

    setGuideActionLoading(true);
    setGuideActionError(null);

    try {
      const response = await fetch("/api/review/guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reveal",
          problemSlug: problem.slug,
          pseudocode: guideDraftSnapshot ?? pseudocode,
          session: guideSession,
        }),
      });

      const data = (await response.json()) as {
        session?: GuideSessionResponse;
        error?: string;
      };

      if (!response.ok || !data.session) {
        throw new Error(
          data.error || "The guide could not reveal that answer right now.",
        );
      }

      setGuideSession(data.session);
    } catch (guideRevealError) {
      setGuideActionError(
        guideRevealError instanceof Error
          ? guideRevealError.message
          : "Something went wrong while revealing that answer.",
      );
    } finally {
      setGuideActionLoading(false);
    }
  }

  function handleGuideAdvance() {
    if (!guideSession?.canAdvance || !guideSession.queuedNextQuestion) {
      return;
    }

    setGuideActionError(null);
    setGuideSession({
      currentQuestion: guideSession.queuedNextQuestion,
      currentAnswer: null,
      verdict: null,
      feedback: null,
      attemptCount: 0,
      revealedAnswer: null,
      queuedNextQuestion: null,
      canAdvance: false,
      completed: false,
    });
  }

  function handleEditorScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (!lineNumberRef.current) {
      return;
    }

    lineNumberRef.current.scrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-1 xl:min-h-0">
      <header className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
        <div className="flex min-w-0 items-center">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <WorkspaceIcon name="back" className="h-4 w-4" />
            Back to problem list
          </Link>
        </div>

        <div className="xl:justify-self-center">
          <h1 className="text-center text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
            {problem.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 xl:justify-self-end">
          <button
            type="submit"
            form="problem-review-form"
            disabled={
              reviewLoading ||
              guideActionLoading ||
              panelMode === "quick_question"
            }
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 ${workspaceAccentButtonClass}`}
          >
            {reviewLoading ? "Running..." : "Run Logic"}
          </button>
          <button
            type="button"
            onClick={handleResetWorkspace}
            disabled={reviewLoading || guideSeedLoading || guideActionLoading}
            className={`${workspaceCardSurfaceClass} inline-flex h-12 w-12 items-center justify-center rounded-2xl text-muted transition hover:border-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60`}
            aria-label="Reset workspace"
            title="Reset workspace"
          >
            <WorkspaceIcon name="reset" />
          </button>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </header>

      <div className="grid gap-4 xl:flex-1 xl:min-h-0 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)]">
        <ProblemPane problem={problem} />

        <div className="grid gap-4 xl:min-h-0 xl:h-full xl:grid-rows-[minmax(220px,0.75fr)_minmax(290px,1fr)]">
          <form
            id="problem-review-form"
            onSubmit={handleReview}
            className={`${workspacePanelSurfaceClass} flex h-full flex-col rounded-[2rem] p-3 xl:min-h-0`}
          >
            <label htmlFor="pseudocode-editor" className="sr-only">
              Pseudocode editor
            </label>
            <div className="flex min-h-[18rem] flex-1 overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(51,56,72,0.92)_0%,rgba(35,40,53,0.96)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus-within:border-white xl:min-h-0">
              <div
                ref={lineNumberRef}
                aria-hidden="true"
                className="min-w-[3.75rem] overflow-hidden border-r border-white/10 bg-[rgba(32,36,48,0.88)] px-3 py-3 font-mono text-[13px] leading-[1.6] text-muted"
              >
                {lineNumbers.map((lineNumber) => (
                  <span key={lineNumber} className="block text-right">
                    {lineNumber}
                  </span>
                ))}
              </div>

              <textarea
                id="pseudocode-editor"
                rows={12}
                value={pseudocode}
                onChange={(event) => setPseudocode(event.target.value)}
                onScroll={handleEditorScroll}
                placeholder="Describe your algorithm step by step..."
                spellCheck={false}
                wrap="off"
                className="min-h-[18rem] w-full flex-1 resize-none overflow-auto bg-transparent px-4 py-3 font-mono text-[13px] leading-[1.7] text-foreground outline-none placeholder:text-muted xl:min-h-0"
              />
            </div>
          </form>

          <FeedbackPanel
            feedback={feedback}
            problemSlug={problem.slug}
            pseudocode={pseudocode}
            resetSignal={feedbackResetSignal}
            panelMode={panelMode}
            onPanelModeChange={setPanelMode}
            guideSession={guideSession}
            guideIsStale={guideIsStale}
            guideLoading={guideSeedLoading}
            guideActionLoading={guideActionLoading}
            guideError={guideActionError}
            onGuideAnswerSubmit={handleGuideAnswerSubmit}
            onGuideReveal={handleGuideReveal}
            onGuideAdvance={handleGuideAdvance}
            reviewLoading={reviewLoading}
            error={panelMode === "ai_guide" ? guideSeedError : standardError}
            className="xl:min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
