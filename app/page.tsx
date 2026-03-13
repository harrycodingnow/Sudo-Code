import { ProblemCatalog } from "@/components/problem-catalog";
import { problems } from "@/data/problems";
import { getProblemSummaries } from "@/lib/problems";

export default function Home() {
  const problemSummaries = getProblemSummaries();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <section className="grid gap-8 rounded-[2rem] border border-border/80 bg-surface/90 p-8 shadow-panel lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="space-y-5">
          <p className="font-mono text-sm uppercase tracking-[0.24em] text-accent">
            Pseudocode interview prep
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-5xl leading-none text-foreground sm:text-6xl">
              SudoCode
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Practice algorithms without getting blocked by syntax.
            </p>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted">
            Work through classic interview problems in plain pseudocode, then
            get concise AI feedback on the logic, gaps, tradeoffs, and edge
            cases a real interviewer would probe.
          </p>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-6">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
              Included in the MVP
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {problems.length} classic DSA prompts
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted">
            <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
              Fast logic review with structured AI feedback
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
              Step-by-step ideal pseudocode and Python reference
            </div>
            <div className="rounded-2xl border border-border/70 bg-surface px-4 py-3">
              Draft persistence in the browser for the current problem
            </div>
          </div>
        </div>
      </section>

      <ProblemCatalog problems={problemSummaries} />
    </main>
  );
}
