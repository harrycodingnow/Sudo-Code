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
  Review,
  ReviewMode,
} from "@/lib/review-schema";
import type { Problem } from "@/types/problem";

type ProblemWorkspaceProps = {
  problem: Problem;
};

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const storageKey = useMemo(
    () => `sudocode:draft:${problem.slug}`,
    [problem.slug],
  );
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const [pseudocode, setPseudocode] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [feedback, setFeedback] = useState<Review | null>(null);
  const [panelMode, setPanelMode] = useState<FeedbackPanelMode>("standard");
  const [feedbackMode, setFeedbackMode] = useState<ReviewMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lineCount = useMemo(
    () => Math.max(12, pseudocode.split("\n").length),
    [pseudocode],
  );
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount],
  );
  const activeReviewMode: ReviewMode =
    panelMode === "standard" ? "standard" : "ai_guide";

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(storageKey);
    if (savedDraft && savedDraft !== problem.starterPseudocode) {
      setPseudocode(savedDraft);
    } else {
      setPseudocode("");
    }
    setDraftReady(true);
  }, [problem.starterPseudocode, storageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    window.localStorage.setItem(storageKey, pseudocode);
  }, [draftReady, pseudocode, storageKey]);

  async function handleReview(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!pseudocode.trim()) {
      setError("Add some pseudocode first so the reviewer has something to assess.");
      setFeedback(null);
      setFeedbackMode(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemSlug: problem.slug,
          pseudocode,
          reviewMode: activeReviewMode,
        }),
      });

      const data = (await response.json()) as { feedback?: Review; error?: string };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error || "The reviewer could not score that attempt.");
      }

      setFeedback(data.feedback);
      setFeedbackMode(activeReviewMode);
    } catch (reviewError) {
      setFeedback(null);
      setFeedbackMode(null);
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Something went wrong while reviewing your logic.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEditorScroll(event: UIEvent<HTMLTextAreaElement>) {
    if (!lineNumberRef.current) {
      return;
    }

    lineNumberRef.current.scrollTop = event.currentTarget.scrollTop;
  }

  return (
    <div className="flex flex-col gap-3 xl:flex-1 xl:min-h-0">
      <header className="rounded-xl border border-border bg-surface px-4 py-2.5 sm:px-5">
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="w-fit rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted hover:border-borderStrong hover:text-foreground"
            >
              Back to problem list
            </Link>

            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {problem.title}
            </h1>
          </div>

          <div className="sm:justify-self-center">
            <button
              type="submit"
              form="problem-review-form"
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check My Logic"}
            </button>
          </div>

          <div className="sm:justify-self-end">
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
        </div>
      </header>

      <div className="grid gap-3 xl:flex-1 xl:min-h-0 xl:grid-cols-[minmax(0,0.97fr)_minmax(0,1fr)]">
        <ProblemPane problem={problem} />

        <div className="grid gap-3 xl:min-h-0 xl:grid-rows-[minmax(300px,0.8fr)_minmax(280px,1fr)]">
          <form
            id="problem-review-form"
            onSubmit={handleReview}
            className="flex h-full flex-col rounded-2xl border border-border bg-surface p-3 xl:min-h-0"
          >
            <label htmlFor="pseudocode-editor" className="sr-only">
              Pseudocode editor
            </label>
            <div className="flex min-h-[18rem] flex-1 overflow-hidden rounded-xl border border-border bg-background transition-colors focus-within:border-white xl:min-h-0">
              <div
                ref={lineNumberRef}
                aria-hidden="true"
                className="min-w-[3.5rem] overflow-hidden border-r border-border bg-surface/80 px-3 py-3 font-mono text-[13px] leading-[1.6] text-muted"
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
                className="min-h-[18rem] w-full flex-1 resize-none overflow-auto bg-background px-4 py-3 font-mono text-[13px] leading-[1.6] text-foreground outline-none placeholder:text-muted xl:min-h-0"
              />
            </div>
          </form>

          <FeedbackPanel
            feedback={feedback}
            problemSlug={problem.slug}
            pseudocode={pseudocode}
            panelMode={panelMode}
            feedbackMode={feedbackMode}
            onPanelModeChange={setPanelMode}
            loading={loading}
            error={error}
            className="xl:min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
