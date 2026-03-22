"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { HomeProgressDashboard } from "@/components/home-progress-dashboard";
import { ProblemCard } from "@/components/problem-card";
import { SiteHeader } from "@/components/site-header";
import {
  buildTrackerHomeSummary,
  buildTrackerRows,
  createInitialTrackerEntries,
  loadTrackerEntries,
} from "@/lib/tracker";
import type { ProblemSummary } from "@/types/problem";
import type { TrackerEntry } from "@/types/tracker";

type ProblemCatalogProps = {
  problems: ProblemSummary[];
};

const panelSurface =
  "border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

export function ProblemCatalog({ problems }: ProblemCatalogProps) {
  const [entries, setEntries] = useState<Record<string, TrackerEntry>>(() =>
    createInitialTrackerEntries(problems),
  );

  useEffect(() => {
    setEntries(loadTrackerEntries(problems));
  }, [problems]);

  const rows = useMemo(
    () => buildTrackerRows(problems, entries),
    [entries, problems],
  );
  const summary = useMemo(() => buildTrackerHomeSummary(rows), [rows]);

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-[1440px] space-y-5 px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        {/* Stats overview */}
        <HomeProgressDashboard summary={summary} />

        {/* Problem list */}
        <section id="problems" className="min-w-0">
          <div className={`${panelSurface} overflow-hidden rounded-[2rem]`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Problems
                </p>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-muted">
                  {rows.length}
                </span>
              </div>
              <Link
                href="/tracker"
                className="text-[13px] font-medium text-muted transition hover:text-foreground"
              >
                Open tracker →
              </Link>
            </div>

            {/* Column headers */}
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_150px] gap-3 border-b border-white/[0.06] bg-white/[0.015] px-7 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted lg:grid">
              <span>Problem</span>
              <span>Difficulty</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.05]">
              {rows.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
