import Link from "next/link";

import { FeaturedProblemList } from "@/components/featured-problem-list";
import { PageFrame } from "@/components/page-frame";
import { SpotlightCard } from "@/components/spotlight-card";
import { getProblemSummaries } from "@/lib/problems";

function ValueCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <SpotlightCard className="linear-card rounded-[1.5rem] p-5">
      <div className="relative z-10 space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-sm leading-6 text-muted">{detail}</p>
      </div>
    </SpotlightCard>
  );
}

export default function Home() {
  const problemSummaries = getProblemSummaries();
  const categoryCount = new Set(
    problemSummaries.map((problem) => problem.category),
  ).size;
  const featuredProblems = problemSummaries.slice(0, 4);
  const featuredTopics = Array.from(
    new Set(problemSummaries.flatMap((problem) => problem.keyConcepts)),
  ).slice(0, 6);

  return (
    <PageFrame mainClassName="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <SpotlightCard className="linear-shell rounded-[2rem] px-6 py-8 sm:px-8">
          <div className="relative z-10 space-y-6">
            <span className="linear-pill inline-flex rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Logic-first interview prep
            </span>

            <div className="space-y-4">
              <h1 className="linear-heading max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Build algorithm before you worry about syntax.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                SudoCode gives you a dedicated problem workspace, an interview
                coach chat, and a tracker that keeps the entire practice loop in
                one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/problems"
                className="linear-accent-button inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                Browse problems
              </Link>
              <Link
                href="/tracker"
                className="linear-soft-button inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                Open tracker
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {featuredTopics.map((topic) => (
                <span
                  key={topic}
                  className="linear-pill inline-flex rounded-full px-3 py-1.5 text-sm text-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </SpotlightCard>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <ValueCard
            label="Problem set"
            value={String(problemSummaries.length)}
            detail="A focused bank of interview-style prompts seeded into the workspace."
          />
          <ValueCard
            label="Categories"
            value={String(categoryCount)}
            detail="Problems span the common algorithm buckets you actually need to practice."
          />
          <ValueCard
            label="Coach mode"
            value="Live"
            detail="Guide chat and review mode are built into every attempt."
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Featured prompts
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Start with something popular.
            </h2>
          </div>

          <Link
            href="/problems"
            className="text-sm font-medium text-muted transition hover:text-foreground"
          >
            See the full catalog
          </Link>
        </div>

        <FeaturedProblemList problems={featuredProblems} />
      </section>
    </PageFrame>
  );
}
