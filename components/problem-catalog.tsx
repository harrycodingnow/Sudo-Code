"use client";

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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-[1440px] space-y-5 px-4 py-4 sm:px-6 lg:px-8">
        <HomeProgressDashboard summary={summary} />

        <section id="problems" className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Problem list
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Pick a problem and open the full brief inside its problem page.
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Home stays compact: title, difficulty, and your current status.
                </p>
              </div>

              <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
                {rows.length} problems
              </div>
            </div>

            <div className="hidden grid-cols-[minmax(0,1fr)_120px_150px] gap-3 border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted lg:grid">
              <span>Problem</span>
              <span>Difficulty</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border">
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
