import type { Review, ReviewVerdict } from "@/lib/review-schema";

const verdictCopy: Record<ReviewVerdict, { label: string; tone: string }> = {
  correct: {
    label: "Logic looks solid",
    tone: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  partially_correct: {
    label: "Close, but missing pieces",
    tone: "border border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  incorrect: {
    label: "Approach needs revision",
    tone: "border border-rose-400/20 bg-rose-400/10 text-rose-200",
  },
};

type FeedbackPanelProps = {
  feedback: Review | null;
  loading: boolean;
  error: string | null;
  className?: string;
};

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="rounded-lg border border-border bg-surface px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">
          Nothing notable here.
        </p>
      )}
    </div>
  );
}

export function FeedbackPanel({
  feedback,
  loading,
  error,
  className = "",
}: FeedbackPanelProps) {
  if (loading) {
    return (
      <section
        className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
      >
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
          Interview coach
        </p>
        <div className="mt-5 space-y-3 text-sm text-muted">
          <p>Reviewing your algorithmic reasoning...</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-white/70" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`flex h-full flex-col rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 ${className}`}
      >
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-rose-200">
          Review unavailable
        </p>
        <p className="mt-3 text-sm leading-6 text-rose-100">{error}</p>
      </section>
    );
  }

  if (!feedback) {
    return (
      <section
        className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}
      >
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
          Feedback
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Correctness
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Whether the overall solution is correct, partially correct, or off track.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Algorithm choice / approach
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Whether the data structure, traversal, and step-by-step plan make sense.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Time & space complexity
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Time and space tradeoffs for the approach you described.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Edge case handling
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Inputs and corner cases your current pseudocode still needs to cover.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const verdict = verdictCopy[feedback.verdict];
  const approachItems = [
    ...feedback.logic_issues,
    ...feedback.missing_steps,
    ...feedback.improvement_suggestions,
  ];

  return (
    <section
      className={`h-full space-y-4 rounded-2xl border border-border bg-surface p-4 ${className}`}
    >
      <div className={`rounded-xl p-4 ${verdict.tone}`}>
        <p className="font-mono text-xs uppercase tracking-[0.18em]">Correctness</p>
        <p className="mt-2 text-sm leading-6 opacity-90">{verdict.label}</p>
        <p className="mt-2 text-base leading-7">{feedback.summary}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FeedbackList
          title="Algorithm choice / approach"
          items={approachItems}
        />
        <FeedbackList title="Edge case handling" items={feedback.edge_cases} />
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
          Time & space complexity
        </h4>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Time complexity
            </h5>
            <p className="mt-3 font-mono text-sm text-foreground">
              {feedback.time_complexity}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Space complexity
            </h5>
            <p className="mt-3 font-mono text-sm text-foreground">
              {feedback.space_complexity}
            </p>
          </div>
        </div>
      </div>

      <FeedbackList
        title="Interviewer follow-up"
        items={feedback.interviewer_followup}
      />
    </section>
  );
}
