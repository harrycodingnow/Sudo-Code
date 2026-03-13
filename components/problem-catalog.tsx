"use client";

import { useMemo, useState } from "react";

import { ProblemCard } from "@/components/problem-card";
import type { Difficulty, ProblemSummary } from "@/types/problem";

const filters: Array<Difficulty | "All"> = ["All", "Easy", "Medium", "Hard"];

type ProblemCatalogProps = {
  problems: ProblemSummary[];
};

export function ProblemCatalog({ problems }: ProblemCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<Difficulty | "All">("All");

  const visibleProblems = useMemo(() => {
    if (activeFilter === "All") {
      return problems;
    }

    return problems.filter((problem) => problem.difficulty === activeFilter);
  }, [activeFilter, problems]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-[0.22em] text-muted">
            Problem set
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Practice by concept, not syntax.
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleProblems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </section>
  );
}
