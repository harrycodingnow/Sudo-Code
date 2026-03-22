import Link from "next/link";

import { DifficultyBadge } from "@/components/difficulty-badge";
import type { TrackerProgressStatus, TrackerRow } from "@/types/tracker";

type ProblemCardProps = {
  problem: TrackerRow;
};

const progressStyles: Record<TrackerProgressStatus, string> = {
  "To Do":
    "bg-white/[0.1] text-white/70",
  "In Progress":
    "bg-amber-500/85 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]",
  "Need Review":
    "bg-rose-500/85 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]",
  Completed:
    "bg-emerald-500/85 text-white shadow-[0_2px_8px_rgba(52,211,153,0.3)]",
};

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block px-6 py-4 transition hover:bg-white/[0.035] sm:px-7"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_160px] lg:items-center">
        {/* Title */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-[0.98rem] font-semibold text-foreground transition group-hover:text-white">
              {problem.title}
            </h3>
            {/* Mobile badges */}
            <div className="flex items-center gap-2 lg:hidden">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span
                className={`inline-flex rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${progressStyles[problem.progress]}`}
              >
                {problem.progress}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: difficulty */}
        <div className="hidden justify-start lg:flex">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Desktop: status */}
        <div className="hidden justify-start lg:flex">
          <span
            className={`inline-flex rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] ${progressStyles[problem.progress]}`}
          >
            {problem.progress}
          </span>
        </div>
      </div>
    </Link>
  );
}
