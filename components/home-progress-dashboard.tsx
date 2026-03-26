import { SpotlightCard } from "@/components/spotlight-card";
import type { Difficulty } from "@/types/problem";
import type { TrackerHomeSummary } from "@/types/tracker";

type HomeProgressDashboardProps = {
  summary: TrackerHomeSummary;
};

type DifficultyMeta = {
  accentClassName: string;
  labelClassName: string;
  trackClassName: string;
};

const difficultyMeta: Record<Difficulty, DifficultyMeta> = {
  Easy: {
    accentClassName: "bg-emerald-300",
    labelClassName: "text-emerald-300",
    trackClassName: "bg-emerald-400",
  },
  Medium: {
    accentClassName: "bg-amber-300",
    labelClassName: "text-amber-300",
    trackClassName: "bg-amber-400",
  },
  Hard: {
    accentClassName: "bg-rose-300",
    labelClassName: "text-rose-300",
    trackClassName: "bg-rose-400",
  },
};

function DifficultyStatCard({
  difficulty,
  solved,
  total,
}: {
  difficulty: Difficulty;
  solved: number;
  total: number;
}) {
  const meta = difficultyMeta[difficulty];
  const percentage = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <SpotlightCard className="linear-card rounded-[1.5rem] p-5">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.accentClassName}`} />
            <p className={`text-sm font-semibold ${meta.labelClassName}`}>
              {difficulty}
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            {percentage}%
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {solved}
            <span className="ml-1 text-lg text-muted">/ {total}</span>
          </p>
          <div className="h-2 rounded-full bg-white/6">
            <div
              className={`h-full rounded-full ${meta.trackClassName}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="linear-card rounded-[1.25rem] px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function HomeProgressDashboard({
  summary,
}: HomeProgressDashboardProps) {
  const completionRate =
    summary.total === 0 ? 0 : Math.round((summary.solved / summary.total) * 100);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
      <SpotlightCard className="linear-shell rounded-[2rem] p-6">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                {completionRate}%
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Covered
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Progress snapshot
              </p>
              <h2 className="linear-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep the practice loop visible.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                The tracker is most useful when it shows what is solved, what is
                active, and where your next revision should happen.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryMetric
                label="Solved"
                value={`${summary.solved} / ${summary.total}`}
              />
              <SummaryMetric
                label="In Progress"
                value={String(summary.attempting)}
              />
              <SummaryMetric
                label="Remaining"
                value={String(Math.max(summary.total - summary.solved, 0))}
              />
            </div>
          </div>
        </div>
      </SpotlightCard>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
        {summary.byDifficulty.map((entry) => (
          <DifficultyStatCard
            key={entry.difficulty}
            difficulty={entry.difficulty}
            solved={entry.solved}
            total={entry.total}
          />
        ))}
      </div>
    </section>
  );
}
