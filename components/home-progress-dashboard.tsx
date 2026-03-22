import type { Difficulty } from "@/types/problem";
import type { TrackerHomeSummary } from "@/types/tracker";

type HomeProgressDashboardProps = {
  summary: TrackerHomeSummary;
};

const panelSurface =
  "border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

const cardSurface =
  "border border-white/10 bg-[linear-gradient(180deg,rgba(68,74,92,0.72)_0%,rgba(55,61,78,0.76)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

const ringRadius = 90;
const ringCircumference = 2 * Math.PI * ringRadius;

type DifficultyMeta = {
  label: string;
  dot: string;
  bar: string;
  glow: string;
};

const difficultyMeta: Record<Difficulty, DifficultyMeta> = {
  Easy:   { label: "text-emerald-300", dot: "bg-emerald-400", bar: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
  Medium: { label: "text-amber-300",   dot: "bg-amber-400",   bar: "bg-amber-400",   glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]"  },
  Hard:   { label: "text-rose-300",    dot: "bg-rose-400",    bar: "bg-rose-400",    glow: "shadow-[0_0_8px_rgba(251,113,133,0.4)]"  },
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
  const m = difficultyMeta[difficulty];
  const pct = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <div className={`${cardSurface} rounded-[1.5rem] px-5 py-4`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${m.dot} ${m.glow}`} />
          <p className={`text-sm font-semibold ${m.label}`}>{difficulty}</p>
        </div>
        <span className="font-mono text-[11px] tracking-[0.1em] text-muted">{pct}%</span>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tracking-tight text-foreground">
        {solved}<span className="text-lg text-muted">/{total}</span>
      </p>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${m.bar} ${m.glow}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function HomeProgressDashboard({ summary }: HomeProgressDashboardProps) {
  const completionRatio = summary.total === 0 ? 0 : summary.solved / summary.total;
  const dashOffset = ringCircumference * (1 - completionRatio);
  const pctLabel = Math.round(completionRatio * 100);

  return (
    <section>
      {/* Two-column stats area */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">

        {/* Ring panel */}
        <div className={`${panelSurface} overflow-hidden rounded-[2rem] p-5`}>
          <div className="relative flex min-h-[14rem] items-center justify-start gap-8 overflow-hidden rounded-[1.5rem] border border-white/8 bg-[linear-gradient(135deg,rgba(51,58,78,0.6)_0%,rgba(35,40,54,0.7)_100%)] px-8 py-6">
            {/* Decorative radial */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(88,142,118,0.18),transparent_55%)]" />

            {/* Ring SVG */}
            <div className="relative shrink-0">
              <svg
                viewBox="0 0 220 220"
                className="h-[9rem] w-[9rem]"
                aria-hidden="true"
              >
                {/* Glow filter */}
                <defs>
                  <filter id="arcGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#86d39b" />
                    <stop offset="100%" stopColor="#6dbf84" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle cx="110" cy="110" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                {/* Arc */}
                <circle
                  cx="110" cy="110" r={ringRadius}
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 110 110)"
                  filter="url(#arcGlow)"
                />
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.6rem] font-bold tracking-tight text-foreground">{pctLabel}<span className="text-base text-muted">%</span></span>
              </div>
            </div>

            {/* Stats text */}
            <div className="relative min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Practice coverage
              </p>
              <p className="mt-2 text-5xl font-bold tracking-tight text-foreground">
                {summary.solved}
                <span className="text-2xl font-semibold text-muted">/{summary.total}</span>
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm">✓</span>
                <span className="text-sm font-medium text-foreground">Solved</span>
              </div>
              {summary.attempting > 0 && (
                <p className="mt-1 text-sm text-muted">
                  {summary.attempting} in progress
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty cards */}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {summary.byDifficulty.map((ds) => (
            <DifficultyStatCard
              key={ds.difficulty}
              difficulty={ds.difficulty}
              solved={ds.solved}
              total={ds.total}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
