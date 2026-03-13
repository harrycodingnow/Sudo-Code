import type { Review, ReviewVerdict } from "@/lib/review-schema";

const verdictCopy: Record<ReviewVerdict, { label: string; tone: string }> = {
  correct: {
    label: "Logic looks solid",
    tone: "border-emerald-700/15 bg-emerald-50 text-emerald-900",
  },
  partially_correct: {
    label: "Close, but missing pieces",
    tone: "border-amber-700/15 bg-amber-50 text-amber-900",
  },
  incorrect: {
    label: "Approach needs revision",
    tone: "border-rose-700/15 bg-rose-50 text-rose-900",
  },
};

type FeedbackPanelProps = {
  feedback: Review | null;
  loading: boolean;
  error: string | null;
};

function FeedbackList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="rounded-xl bg-surface px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">Nothing notable here.</p>
      )}
    </div>
  );
}

export function FeedbackPanel({
  feedback,
  loading,
  error,
}: FeedbackPanelProps) {
  if (loading) {
    return (
      <section className="rounded-[1.5rem] border border-border/70 bg-surface/95 p-6 shadow-panel">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
          Interview coach
        </p>
        <div className="mt-5 space-y-3 text-sm text-muted">
          <p>Reviewing your algorithmic reasoning...</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 shadow-panel">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-rose-700">
          Review unavailable
        </p>
        <p className="mt-3 text-sm leading-6 text-rose-900">{error}</p>
      </section>
    );
  }

  if (!feedback) {
    return (
      <section className="rounded-[1.5rem] border border-border/70 bg-surface/95 p-6 shadow-panel">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
          Interview coach
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Submit pseudocode to get feedback on whether the idea is correct,
          which steps are missing, and what an interviewer would ask next.
        </p>
      </section>
    );
  }

  const verdict = verdictCopy[feedback.verdict];

  return (
    <section className="space-y-5 rounded-[1.5rem] border border-border/70 bg-surface/95 p-6 shadow-panel">
      <div className={`rounded-[1.25rem] border p-4 ${verdict.tone}`}>
        <p className="font-mono text-xs uppercase tracking-[0.18em]">
          {verdict.label}
        </p>
        <p className="mt-2 text-base leading-7">{feedback.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Time complexity
          </h4>
          <p className="mt-3 font-mono text-sm text-foreground">
            {feedback.time_complexity}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Space complexity
          </h4>
          <p className="mt-3 font-mono text-sm text-foreground">
            {feedback.space_complexity}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <FeedbackList title="Missing steps" items={feedback.missing_steps} />
        <FeedbackList title="Logic issues" items={feedback.logic_issues} />
        <FeedbackList title="Edge cases" items={feedback.edge_cases} />
        <FeedbackList
          title="Suggested improvements"
          items={feedback.improvement_suggestions}
        />
      </div>

      <FeedbackList
        title="Interviewer follow-up"
        items={feedback.interviewer_followup}
      />
    </section>
  );
}
