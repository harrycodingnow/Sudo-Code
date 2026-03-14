import type { Problem } from "@/types/problem";

type ProblemPaneProps = {
  problem: Problem;
};

export function ProblemPane({ problem }: ProblemPaneProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 xl:flex xl:min-h-0 xl:flex-col xl:overflow-y-auto xl:p-5">
      <div className="space-y-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Description
          </p>
          <p className="mt-3 text-sm leading-7 text-foreground sm:text-base">
            {problem.description}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <section className="rounded-2xl border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Examples
          </p>
          <div className="mt-4 space-y-4">
            {problem.examples.map((example, index) => (
              <article
                key={`${example.input}-${example.output}`}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">Example {index + 1}</p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    Sample
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-lg border border-border bg-background px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      Input
                    </p>
                    <p className="mt-2 font-mono text-sm leading-6 text-foreground">
                      {example.input}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-background px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      Output
                    </p>
                    <p className="mt-2 font-mono text-sm leading-6 text-foreground">
                      {example.output}
                    </p>
                  </div>
                </div>

                {example.explanation ? (
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {example.explanation}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-background p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Constraints
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-foreground sm:grid-cols-2">
            {problem.constraints.map((constraint) => (
              <li
                key={constraint}
                className="rounded-xl border border-border bg-surface px-4 py-3"
              >
                {constraint}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
