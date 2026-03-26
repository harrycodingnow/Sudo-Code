"use client";

import { useEffect, useMemo, useState } from "react";

import { ProblemCard } from "@/components/problem-card";
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

function SummaryStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="linear-card rounded-[1.4rem] px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}

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
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryStat
          label="Progress"
          value={`${summary.solved}/${summary.total}`}
          detail="Problems marked completed out of the full practice set."
        />
        <SummaryStat
          label="In Progress"
          value={String(summary.attempting)}
          detail="Active problems that still need another pass."
        />
        <SummaryStat
          label="Remaining"
          value={String(Math.max(summary.total - summary.solved, 0))}
          detail="Problems still open for a first solve or revisit."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Problems
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Practice queue
          </h1>
        </div>

        <p className="max-w-xl text-sm leading-6 text-muted">
          Use the tracker state to decide whether you want a clean attempt, a
          review session, or a harder prompt.
        </p>
      </div>

      <div className="linear-shell overflow-hidden rounded-[2rem]">
        <div className="hidden grid-cols-[minmax(0,1fr)_160px] gap-4 border-b border-white/6 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted lg:grid">
          <span>Problem</span>
          <span className="text-right">Next step</span>
        </div>

        <div>
          {rows.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      </div>
    </section>
  );
}
