import type { Difficulty } from "@/types/problem";
import type { TrackerHomeSummary } from "@/types/tracker";

type HomeProgressDashboardProps = {
  summary: TrackerHomeSummary;
};

const difficultyLabelStyles: Record<Difficulty, string> = {
  Easy: "text-emerald-300",
  Medium: "text-amber-300",
  Hard: "text-rose-300",
};

const ringRadius = 112;
const ringCircumference = 2 * Math.PI * ringRadius;

function DifficultyStatCard({
  difficulty,
  solved,
  total,
}: {
  difficulty: Difficulty;
  solved: number;
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-6">
      <p className={`text-2xl font-semibold ${difficultyLabelStyles[difficulty]}`}>
        {difficulty}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {solved}/{total}
      </p>
    </div>
  );
}

export function HomeProgressDashboard({
  summary,
}: HomeProgressDashboardProps) {
  const completionRatio = summary.total === 0 ? 0 : summary.solved / summary.total;
  const dashOffset = ringCircumference * (1 - completionRatio);

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Progress
        </h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_220px]">
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-2xl bg-background">
            <svg
              viewBox="0 0 280 280"
              className="h-[18rem] w-full max-w-[20rem] text-white/10 sm:h-[20rem]"
              aria-hidden="true"
            >
              <circle
                cx="140"
                cy="140"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
              />
              <circle
                cx="140"
                cy="140"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                strokeLinecap="round"
                className="text-emerald-400"
                strokeDasharray={ringCircumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 140 140)"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-6xl font-semibold tracking-tight text-foreground sm:text-7xl">
                {summary.solved}
                <span className="text-3xl text-muted sm:text-4xl">/{summary.total}</span>
              </p>
              <p className="mt-3 text-2xl font-medium text-foreground">
                <span className="mr-2 text-emerald-400">✓</span>
                Solved
              </p>
              <p className="mt-12 text-xl font-medium text-muted sm:mt-14">
                {summary.attempting} Attempting
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {summary.byDifficulty.map((difficultySummary) => (
            <DifficultyStatCard
              key={difficultySummary.difficulty}
              difficulty={difficultySummary.difficulty}
              solved={difficultySummary.solved}
              total={difficultySummary.total}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
