import Link from "next/link";

import { DifficultyBadge } from "@/components/difficulty-badge";
import type { ProblemSummary } from "@/types/problem";

type ProblemCardProps = {
  problem: ProblemSummary;
};

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block px-4 py-4 hover:bg-white/5 sm:px-5"
    >
      <div className="grid gap-3 lg:grid-cols-[64px_minmax(0,1fr)_200px_110px] lg:items-center">
        <div className="hidden font-mono text-xs tracking-[0.18em] text-muted lg:block">
          {problem.id.padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3 lg:block">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-white sm:text-lg">
              {problem.title}
            </h3>
            <div className="lg:hidden">
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="lg:hidden">{problem.category}</span>
            <span className="hidden lg:inline">{problem.keyConcepts.join(" · ")}</span>
            <span className="lg:hidden">{problem.keyConcepts.slice(0, 2).join(" · ")}</span>
          </div>
        </div>

        <div className="hidden text-sm text-muted lg:block">
          <p>{problem.category}</p>
        </div>

        <div className="hidden justify-start lg:flex">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </div>
    </Link>
  );
}
