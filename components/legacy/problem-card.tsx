import Link from "next/link";

import { DifficultyBadge } from "@/components/legacy/difficulty-badge";
import {
  ProblemListLeadingStatus,
  ProblemListStatusBadge,
} from "@/components/legacy/problem-list-status-badge";
import type { TrackerRow } from "@/types/tracker";

type ProblemCardProps = {
  problem: TrackerRow;
};

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block border-b border-white/6 last:border-b-0"
    >
      <div className="px-5 py-5 transition hover:bg-white/[0.035] sm:px-6">
        <div className="flex items-start gap-2.5">
          <ProblemListLeadingStatus progress={problem.progress} />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <h3 className="min-w-0 text-2xl font-semibold tracking-tight text-foreground transition group-hover:text-white">
                {problem.title}
              </h3>
              <ProblemListStatusBadge progress={problem.progress} />
            </div>
            <div className="shrink-0">
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
