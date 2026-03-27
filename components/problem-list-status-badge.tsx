import { cn } from "@/lib/cn";
import type { TrackerProgressStatus } from "@/types/tracker";

const statusStyles: Partial<Record<TrackerProgressStatus, string>> = {
  "In Progress": "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

const statusLabels: Partial<Record<TrackerProgressStatus, string>> = {
  "In Progress": "Work in progress",
};

export function ProblemListLeadingStatus({
  progress,
}: {
  progress: TrackerProgressStatus;
}) {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 self-center items-center justify-center rounded-full"
      aria-label={progress === "Completed" ? "Completed" : undefined}
    >
      {progress === "Completed" ? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-emerald-300"
          aria-hidden="true"
        >
          <path d="m3.75 8.25 2.5 2.5 6-6" />
        </svg>
      ) : null}
    </span>
  );
}

export function ProblemListStatusBadge({
  progress,
}: {
  progress: TrackerProgressStatus;
}) {
  const label = statusLabels[progress];
  const style = statusStyles[progress];

  if (!label || !style) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
        style,
      )}
    >
      {label}
    </span>
  );
}
