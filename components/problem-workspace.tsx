"use client";

import { useEffect, useMemo, useState } from "react";

import { FeedbackPanel } from "@/components/feedback-panel";
import type { Review } from "@/lib/review-schema";
import type { Problem } from "@/types/problem";

type ProblemWorkspaceProps = {
  problem: Problem;
};

export function ProblemWorkspace({ problem }: ProblemWorkspaceProps) {
  const storageKey = useMemo(
    () => `sudocode:draft:${problem.slug}`,
    [problem.slug],
  );
  const [pseudocode, setPseudocode] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [feedback, setFeedback] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(storageKey);
    if (savedDraft) {
      setPseudocode(savedDraft);
    } else {
      setPseudocode(problem.starterPseudocode);
    }
    setDraftReady(true);
  }, [problem.starterPseudocode, storageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    window.localStorage.setItem(storageKey, pseudocode);
  }, [draftReady, pseudocode, storageKey]);

  async function handleReview() {
    if (!pseudocode.trim()) {
      setError("Add some pseudocode first so the reviewer has something to assess.");
      setFeedback(null);
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
        }),
      });

      const data = (await response.json()) as { feedback?: Review; error?: string };

      if (!response.ok || !data.feedback) {
        throw new Error(data.error || "The reviewer could not score that attempt.");
      }

      setFeedback(data.feedback);
    } catch (reviewError) {
      setFeedback(null);
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Something went wrong while reviewing your logic.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="space-y-6 rounded-[1.75rem] border border-border/70 bg-surface/95 p-6 shadow-panel lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
              Your working area
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Write the algorithm in plain English-style pseudocode. The review
              focuses on reasoning and structure, not syntax.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPseudocode(problem.starterPseudocode)}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
            >
              Try sample pseudocode
            </button>
            <button
              type="button"
              onClick={() => setSolutionOpen((current) => !current)}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
            >
              {solutionOpen ? "Hide Solution" : "Reveal Solution"}
            </button>
            <button
              type="button"
              onClick={handleReview}
              disabled={loading}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check My Logic"}
            </button>
          </div>
        </div>

        <label className="block">
          <span className="sr-only">Pseudocode editor</span>
          <textarea
            value={pseudocode}
            onChange={(event) => setPseudocode(event.target.value)}
            placeholder="Describe your algorithm step by step..."
            className="min-h-[420px] w-full rounded-[1.5rem] border border-border bg-background/70 px-5 py-4 font-mono text-sm leading-7 text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>

        {solutionOpen ? (
          <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <div className="rounded-2xl border border-border/70 bg-surface p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Ideal pseudocode
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                {problem.idealPseudocode}
              </pre>
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface p-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Python reference
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-7 text-foreground">
                {problem.referencePython}
              </pre>
            </div>
          </div>
        ) : null}
      </section>

      <FeedbackPanel feedback={feedback} loading={loading} error={error} />
    </div>
  );
}
