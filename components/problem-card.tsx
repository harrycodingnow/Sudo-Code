import Link from "next/link";

import { DifficultyBadge } from "@/components/difficulty-badge";
import type { TrackerProgressStatus, TrackerRow } from "@/types/tracker";

type ProblemCardProps = {
  problem: TrackerRow;
};

const progressStyles: Record<TrackerProgressStatus, string> = {
  "To Do": "border border-white/10 bg-white/5 text-white",
  "In Progress": "border border-amber-400/20 bg-amber-400/10 text-amber-300",
  "Need Review": "border border-rose-400/20 bg-rose-400/10 text-rose-300",
  Completed: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block px-4 py-4 hover:bg-white/5 sm:px-5"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_150px] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-white">
              {problem.title}
            </h3>
            <div className="flex items-center gap-2 lg:hidden">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${progressStyles[problem.progress]}`}
              >
                {problem.progress}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden justify-start lg:flex">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="hidden justify-start lg:flex">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${progressStyles[problem.progress]}`}
          >
            {problem.progress}
          </span>
        </div>
      </div>
    </Link>
  );
}
