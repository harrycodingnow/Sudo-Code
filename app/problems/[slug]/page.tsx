import Link from "next/link";
import { notFound } from "next/navigation";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { ProblemWorkspace } from "@/components/problem-workspace";
import { problems } from "@/data/problems";
import { getProblemBySlug } from "@/lib/problems";

type ProblemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return problems.map((problem) => ({
    slug: problem.slug,
  }));
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    return {
      title: "Problem not found | SudoCode",
    };
  }

  return {
    title: `${problem.title} | SudoCode`,
    description: `Practice ${problem.title} in pseudocode and get AI interview feedback.`,
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <Link
        href="/"
        className="w-fit rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
      >
        Back to problem list
      </Link>

      <section className="rounded-[1.75rem] border border-border/70 bg-surface/95 p-6 shadow-panel lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
              {problem.category}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-none text-foreground sm:text-5xl">
              {problem.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-muted">
              {problem.description}
            </p>
          </div>

          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Examples
            </p>
            <div className="mt-4 space-y-4">
              {problem.examples.map((example) => (
                <div
                  key={`${example.input}-${example.output}`}
                  className="rounded-2xl border border-border/70 bg-surface p-4"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                    Input
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    {example.input}
                  </p>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted">
                    Output
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    {example.output}
                  </p>
                  {example.explanation ? (
                    <p className="mt-4 text-sm leading-6 text-muted">
                      {example.explanation}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Constraints
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              {problem.constraints.map((constraint) => (
                <li
                  key={constraint}
                  className="rounded-2xl border border-border/70 bg-surface px-4 py-3"
                >
                  {constraint}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-border/70 bg-surface p-4">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                Core concepts
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.keyConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProblemWorkspace problem={problem} />
    </main>
  );
}
