import Link from "next/link";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { cn } from "@/lib/cn";
import type { TrackerProgressStatus, TrackerRow } from "@/types/tracker";

type ProblemCardProps = {
  problem: TrackerRow;
};

const progressStyles: Record<TrackerProgressStatus, string> = {
  "To Do": "border-white/10 bg-white/5 text-muted",
  "In Progress": "border-amber-400/20 bg-amber-400/10 text-amber-300",
  "Need Review": "border-rose-400/20 bg-rose-400/10 text-rose-300",
  Completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

function MetaPill({ children }: { children: string }) {
  return (
    <span className="linear-pill inline-flex rounded-full px-3 py-1 text-[11px] font-medium text-foreground">
      {children}
    </span>
  );
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block border-b border-white/6 last:border-b-0"
    >
      <div className="flex flex-col gap-4 px-5 py-5 transition hover:bg-white/[0.035] sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {problem.category}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <h3 className="text-2xl font-semibold tracking-tight text-foreground transition group-hover:text-white">
              {problem.title}
            </h3>
            <DifficultyBadge difficulty={problem.difficulty} />
            <span
              className={cn(
                "inline-flex w-fit rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
                progressStyles[problem.progress],
              )}
            >
              {problem.progress}
            </span>
            <MetaPill>{problem.timeComplexity}</MetaPill>
            <MetaPill>{problem.spaceComplexity}</MetaPill>
          </div>

          <div className="flex flex-wrap gap-2">
            {problem.topicTags.slice(0, 3).map((tag) => (
              <MetaPill key={tag}>{tag}</MetaPill>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 text-sm lg:items-end">
          <span className="text-muted">
            {problem.dateSolved ? `Solved ${problem.dateSolved}` : "Open a fresh attempt"}
          </span>
          <span className="font-medium text-foreground transition group-hover:text-white">
            Open workspace
          </span>
        </div>
      </div>
    </Link>
  );
}
