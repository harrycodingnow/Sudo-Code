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
      className="group grid gap-5 rounded-[1.5rem] border border-border/70 bg-surface/95 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {problem.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground transition group-hover:text-accent">
            {problem.title}
          </h3>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="flex flex-wrap gap-2">
        {problem.keyConcepts.map((concept) => (
          <span
            key={concept}
            className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted"
          >
            {concept}
          </span>
        ))}
      </div>
    </Link>
  );
}
