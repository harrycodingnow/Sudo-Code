"use client";

import Link from "next/link";

import { ProblemCard } from "@/components/problem-card";
import type { ProblemSummary } from "@/types/problem";

type ProblemCatalogProps = {
  problems: ProblemSummary[];
};

export function ProblemCatalog({ problems }: ProblemCatalogProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-semibold text-white"
            >
              S
            </Link>
            <div>
              <p className="text-lg font-semibold text-foreground">SudoCode</p>
              <p className="text-xs text-muted">Pseudocode interview practice</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <a href="#problems" className="hover:text-white">
              Problems
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <section id="problems" className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Problem list
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Focus on reasoning, not runtime execution.
                </h2>
                <p className="mt-1 text-sm text-muted">
                  A compact, interview-oriented set of problems for practicing
                  algorithms in pseudocode.
                </p>
              </div>

              <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
                {problems.length} problems
              </div>
            </div>

            <div className="hidden grid-cols-[64px_minmax(0,1fr)_200px_110px] gap-3 border-b border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted lg:grid">
              <span>#</span>
              <span>Problem</span>
              <span>Category</span>
              <span>Difficulty</span>
            </div>

            <div className="divide-y divide-border">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
