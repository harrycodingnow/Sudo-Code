"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DifficultyBadge } from "@/components/legacy/difficulty-badge";
import {
  ProblemListLeadingStatus,
  ProblemListStatusBadge,
} from "@/components/legacy/problem-list-status-badge";
import {
  createInitialTrackerEntries,
  loadTrackerEntries,
} from "@/lib/tracker";
import type { ProblemSummary } from "@/types/problem";
import type { TrackerEntry } from "@/types/tracker";

export function FeaturedProblemList({
  problems,
}: {
  problems: ProblemSummary[];
}) {
  const [entries, setEntries] = useState<Record<string, TrackerEntry>>(() =>
    createInitialTrackerEntries(problems),
  );

  useEffect(() => {
    setEntries(loadTrackerEntries(problems));
  }, [problems]);

  return (
    <div className="linear-shell overflow-hidden rounded-[2rem]">
      {problems.map((problem) => (
        <Link
          key={problem.id}
          href={`/problems/${problem.slug}`}
          className="group block border-b border-white/6 last:border-b-0"
        >
          <div className="px-5 py-5 transition hover:bg-white/[0.035] sm:px-6">
            <div className="flex items-start gap-2.5">
              <ProblemListLeadingStatus
                progress={entries[problem.slug]?.progress ?? "To Do"}
              />
              <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <h3 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground transition group-hover:text-white">
                    {problem.title}
                  </h3>
                  <ProblemListStatusBadge
                    progress={entries[problem.slug]?.progress ?? "To Do"}
                  />
                </div>
                <div className="shrink-0">
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
