"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react";

import {
  TRACKER_DIFFICULTY_ORDER,
  TRACKER_PROGRESS_ORDER,
  TRACKER_REVIEW_FREQUENCY_ORDER,
  buildCalendarDays,
  buildTrackerRows,
  createInitialTrackerEntries,
  formatSolvedDate,
  getCalendarMonthLabel,
  groupRowsByDifficulty,
  groupRowsByProgress,
  groupRowsByReviewFrequency,
  loadTrackerEntries,
  saveTrackerEntries,
  shiftCalendarMonth,
  startOfCalendarMonth,
} from "@/lib/tracker";
import type { ProblemSummary } from "@/types/problem";
import type {
  TrackerEntry,
  TrackerProgressStatus,
  TrackerReviewFrequency,
  TrackerRow,
  TrackerView,
} from "@/types/tracker";

type ProblemTrackerProps = {
  problems: ProblemSummary[];
};

type TrackerColumnKey =
  | "name"
  | "sourceUrl"
  | "difficulty"
  | "topic"
  | "progress"
  | "timeComplexity"
  | "spaceComplexity"
  | "timeSpent"
  | "dateSolved"
  | "language"
  | "reviewFrequency"
  | "companies"
  | "notes";

const trackerColumns: Array<{
  key: TrackerColumnKey;
  label: string;
  widthClassName: string;
}> = [
  { key: "name", label: "Name", widthClassName: "w-[240px]" },
  { key: "sourceUrl", label: "LeetCode URL", widthClassName: "w-[220px]" },
  { key: "difficulty", label: "Difficulty", widthClassName: "w-[150px]" },
  { key: "topic", label: "Topic", widthClassName: "w-[180px]" },
  { key: "progress", label: "Problem Progress", widthClassName: "w-[170px]" },
  {
    key: "timeComplexity",
    label: "Time Complexity",
    widthClassName: "w-[150px]",
  },
  {
    key: "spaceComplexity",
    label: "Space Complexity",
    widthClassName: "w-[150px]",
  },
  { key: "timeSpent", label: "Time Spent", widthClassName: "w-[110px]" },
  { key: "dateSolved", label: "Date Solved", widthClassName: "w-[170px]" },
  { key: "language", label: "Language", widthClassName: "w-[130px]" },
  {
    key: "reviewFrequency",
    label: "Frequency of Review",
    widthClassName: "w-[170px]",
  },
  { key: "companies", label: "Companies", widthClassName: "w-[180px]" },
  { key: "notes", label: "Notes", widthClassName: "w-[220px]" },
];

const trackerViews: Array<{ key: TrackerView; label: string; icon: string }> = [
  { key: "main", label: "Main Page", icon: "table" },
  { key: "progress", label: "Sort by Progress Status", icon: "progress" },
  { key: "difficulty", label: "Sort by Difficulty Level", icon: "difficulty" },
  { key: "revision", label: "Need Revision", icon: "revision" },
  { key: "solved_date", label: "Solved Date", icon: "calendar" },
];

function Icon({
  name,
  className = "h-3.5 w-3.5",
}: {
  name:
    | "table"
    | "progress"
    | "difficulty"
    | "revision"
    | "calendar"
    | "chevron-left"
    | "chevron-right"
    | "close";
  className?: string;
}) {
  const props: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "table":
      return (
        <svg {...props}>
          <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
          <path d="M2.5 6.5h11M6.5 3v10" />
        </svg>
      );
    case "progress":
      return (
        <svg {...props}>
          <path d="M4 12V7m4 5V4m4 8V6" />
        </svg>
      );
    case "difficulty":
      return (
        <svg {...props}>
          <path d="M3 12h10M5 12V8m3 4V6m3 6V4" />
        </svg>
      );
    case "revision":
      return (
        <svg {...props}>
          <path d="M5 5.5A3.5 3.5 0 1 1 3.8 8" />
          <path d="M2.8 4.8v3h3" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
          <path d="M5 2.5v2M11 2.5v2M2.5 6.5h11" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...props}>
          <path d="m9.5 3.5-4 4 4 4" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path d="m6.5 3.5 4 4-4 4" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M4 4l8 8M12 4 4 12" />
        </svg>
      );
  }
}

function TrackerBadge({
  label,
  tone,
}: {
  label: string;
  tone:
    | "easy"
    | "medium"
    | "hard"
    | "todo"
    | "progress"
    | "review"
    | "completed"
    | "daily"
    | "weekly"
    | "monthly"
    | "once"
    | "language-js"
    | "language-cpp"
    | "language-python"
    | "language-java"
    | "language-ts"
    | "topic"
    | "complexity";
}) {
  const styles: Record<typeof tone, string> = {
    easy:    "bg-emerald-500/85 text-white shadow-[0_2px_8px_rgba(52,211,153,0.3)]",
    medium:  "bg-amber-500/85 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]",
    hard:    "bg-rose-500/85 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]",
    todo:    "bg-white/[0.1] text-white/70",
    progress: "bg-amber-500/85 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]",
    review:  "bg-rose-500/85 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]",
    completed: "bg-emerald-500/85 text-white shadow-[0_2px_8px_rgba(52,211,153,0.3)]",
    daily:   "bg-rose-500/85 text-white",
    weekly:  "bg-amber-500/85 text-white",
    monthly: "bg-yellow-500/85 text-white",
    once:    "bg-white/[0.1] text-white/70",
    "language-js":     "bg-amber-500/85 text-white",
    "language-cpp":    "bg-sky-500/85 text-white",
    "language-python": "bg-emerald-500/85 text-white",
    "language-java":   "bg-orange-500/85 text-white",
    "language-ts":     "bg-cyan-500/85 text-white",
    topic:      "bg-fuchsia-500/70 text-white",
    complexity: "bg-white/[0.1] text-white/70",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] ${styles[tone]}`}
    >
      {label}
    </span>
  );
}

function getDifficultyTone(row: TrackerRow) {
  if (row.difficulty === "Easy") return "easy";
  if (row.difficulty === "Medium") return "medium";
  return "hard";
}

function getProgressTone(progress: TrackerProgressStatus) {
  switch (progress) {
    case "To Do":
      return "todo";
    case "In Progress":
      return "progress";
    case "Need Review":
      return "review";
    case "Completed":
      return "completed";
  }
}

function getFrequencyTone(frequency: TrackerReviewFrequency) {
  switch (frequency) {
    case "Daily":
      return "daily";
    case "Weekly":
      return "weekly";
    case "Monthly":
      return "monthly";
    case "Once":
      return "once";
  }
}

function getLanguageTone(language: string) {
  const normalized = language.toLowerCase();

  if (normalized.includes("typescript")) return "language-ts";
  if (normalized.includes("javascript")) return "language-js";
  if (normalized.includes("c++")) return "language-cpp";
  if (normalized.includes("python")) return "language-python";
  if (normalized.includes("java")) return "language-java";
  return "complexity";
}

function displaySourceUrl(sourceUrl: string) {
  return sourceUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

function formatTimeSpent(minutes: number | null) {
  return minutes == null ? "—" : `${minutes}`;
}

function TrackerTable({
  rows,
  onRowSelect,
}: {
  rows: TrackerRow[];
  onRowSelect: (row: TrackerRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1980px] table-fixed border-collapse">
        <thead>
          <tr className="border-b border-border/70 bg-white/[0.02]">
            {trackerColumns.map((column) => (
              <th
                key={column.key}
                className={`${column.widthClassName} px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.16em] text-muted`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr
                key={row.slug}
                onClick={() => onRowSelect(row)}
                className="cursor-pointer border-b border-border/70 transition hover:bg-white/[0.035]"
              >
                <td className="px-3 py-3 align-top">
                  <div className="min-w-0">
                    <Link
                      href={`/problems/${row.slug}`}
                      onClick={(event) => event.stopPropagation()}
                      className="line-clamp-2 text-sm font-semibold text-foreground hover:text-white"
                    >
                      {row.title}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="block truncate text-sm text-muted hover:text-white"
                  >
                    {displaySourceUrl(row.sourceUrl)}
                  </a>
                </td>
                <td className="px-3 py-3 align-top">
                  <TrackerBadge
                    label={row.difficulty}
                    tone={getDifficultyTone(row)}
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {row.topicTags.map((tag) => (
                      <TrackerBadge key={tag} label={tag} tone="topic" />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <TrackerBadge
                    label={row.progress}
                    tone={getProgressTone(row.progress)}
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <TrackerBadge
                    label={row.timeComplexity}
                    tone="complexity"
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <TrackerBadge
                    label={row.spaceComplexity}
                    tone="complexity"
                  />
                </td>
                <td className="px-3 py-3 align-top text-right text-sm text-foreground">
                  {formatTimeSpent(row.timeSpentMinutes)}
                </td>
                <td className="px-3 py-3 align-top text-sm text-foreground">
                  {formatSolvedDate(row.dateSolved)}
                </td>
                <td className="px-3 py-3 align-top">
                  {row.language ? (
                    <TrackerBadge
                      label={row.language}
                      tone={getLanguageTone(row.language)}
                    />
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <TrackerBadge
                    label={row.reviewFrequency}
                    tone={getFrequencyTone(row.reviewFrequency)}
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  {row.companies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {row.companies.map((company) => (
                        <TrackerBadge
                          key={company}
                          label={company}
                          tone="topic"
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  {row.notes ? (
                    <span className="block truncate text-sm text-foreground">
                      {row.notes}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={trackerColumns.length}
                className="px-3 py-6 text-center text-sm text-muted"
              >
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GroupedTrackerSection({
  label,
  count,
  tone,
  rows,
  onRowSelect,
}: {
  label: string;
  count: number;
  tone:
    | "easy"
    | "medium"
    | "hard"
    | "todo"
    | "progress"
    | "review"
    | "completed"
    | "daily"
    | "weekly"
    | "monthly"
    | "once";
  rows: TrackerRow[];
  onRowSelect: (row: TrackerRow) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted">+</span>
        <TrackerBadge label={label} tone={tone} />
        <span className="text-sm text-muted">{count}</span>
      </div>
      <TrackerTable rows={rows} onRowSelect={onRowSelect} />
    </section>
  );
}

function TrackerDrawer({
  row,
  draft,
  onClose,
  onSave,
  onChange,
}: {
  row: TrackerRow;
  draft: TrackerEntry;
  onClose: () => void;
  onSave: () => void;
  onChange: (nextEntry: TrackerEntry) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/55 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close tracker editor"
        onClick={onClose}
        className="flex-1 cursor-default"
      />
      <aside className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.12),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.98)_0%,rgba(29,34,46,0.99)_100%)] shadow-[-30px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-xl relative flex h-full w-full max-w-[440px] flex-col rounded-l-[2rem]">
        <div className="flex items-start justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Edit tracker row
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {row.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TrackerBadge label={row.difficulty} tone={getDifficultyTone(row)} />
              {row.topicTags.map((tag) => (
                <TrackerBadge key={tag} label={tag} tone="topic" />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-white/10 bg-white/[0.04] rounded-xl p-2 text-muted hover:border-white/20 hover:text-white transition"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="border border-white/10 bg-[linear-gradient(180deg,rgba(68,74,92,0.72)_0%,rgba(55,61,78,0.76)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-[1.5rem] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              Problem context
            </p>
            <div className="mt-3 space-y-3 text-sm text-foreground">
              <div>
                <p className="text-xs text-muted">Practice page</p>
                <Link
                  href={`/problems/${row.slug}`}
                  className="mt-1 inline-block font-medium hover:text-white"
                >
                  Open local problem
                </Link>
              </div>
              <div>
                <p className="text-xs text-muted">Source URL</p>
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block break-all font-medium hover:text-white"
                >
                  {row.sourceUrl}
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted">Time complexity</p>
                  <div className="mt-1">
                    <TrackerBadge label={row.timeComplexity} tone="complexity" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted">Space complexity</p>
                  <div className="mt-1">
                    <TrackerBadge label={row.spaceComplexity} tone="complexity" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Progress
              </label>
              <select
                value={draft.progress}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    progress: event.target.value as TrackerProgressStatus,
                  })
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[rgba(36,42,58,0.8)] px-3 text-sm text-foreground outline-none focus:border-white/30"
              >
                {TRACKER_PROGRESS_ORDER.map((progress) => (
                  <option key={progress} value={progress}>
                    {progress}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Frequency of review
              </label>
              <select
                value={draft.reviewFrequency}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    reviewFrequency: event.target.value as TrackerReviewFrequency,
                  })
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-[rgba(36,42,58,0.8)] px-3 text-sm text-foreground outline-none focus:border-white/30"
              >
                {TRACKER_REVIEW_FREQUENCY_ORDER.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Time spent
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.timeSpentMinutes ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      timeSpentMinutes:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    })
                  }
                  placeholder="Minutes"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-white"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Date solved
                </label>
                <input
                  type="date"
                  value={draft.dateSolved ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      dateSolved: event.target.value || null,
                    })
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Language
                </label>
                <input
                  type="text"
                  value={draft.language}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      language: event.target.value,
                    })
                  }
                  placeholder="Python, C++, JavaScript..."
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-white"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  Companies
                </label>
                <input
                  type="text"
                  value={draft.companies.join(", ")}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      companies: event.target.value
                        .split(",")
                        .map((company) => company.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Meta, Google, Amazon"
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background/80 px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Notes
              </label>
              <textarea
                value={draft.notes}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    notes: event.target.value,
                  })
                }
                rows={6}
                placeholder="Capture what felt easy, what needs a revisit, or what pattern to recall next time."
                className="mt-2 w-full rounded-xl border border-border bg-background/80 px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/70 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="app-panel-soft rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-[linear-gradient(180deg,#86d39b_0%,#6dbf84_100%)] px-4 py-2 text-sm font-semibold text-[#142018] shadow-[0_8px_20px_rgba(63,118,84,0.3)] hover:brightness-105 transition"
          >
            Save
          </button>
        </div>
      </aside>
    </div>
  );
}

function CalendarView({
  monthDate,
  rows,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  onRowSelect,
}: {
  monthDate: Date;
  rows: TrackerRow[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onRowSelect: (row: TrackerRow) => void;
}) {
  const calendarDays = buildCalendarDays(monthDate, rows);
  const hasRowsThisMonth = calendarDays.some(
    (day) => day.inCurrentMonth && day.rows.length > 0,
  );

  return (
    <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl rounded-[2rem]">
      <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Solved date
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {getCalendarMonthLabel(monthDate)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="app-panel-soft rounded-xl p-2 text-muted hover:text-white"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCurrentMonth}
            className="app-panel-soft rounded-xl px-3 py-2 text-sm font-medium text-muted hover:text-white"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="app-panel-soft rounded-xl p-2 text-muted hover:text-white"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border/70 bg-white/[0.02]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-3 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7">
        {calendarDays.map((day) => (
          <div
            key={day.isoDate}
            className={`min-h-[9rem] border-b border-r border-border/70 px-3 py-3 ${
              day.inCurrentMonth ? "bg-transparent" : "bg-white/[0.02]"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-sm font-semibold ${
                  day.isToday
                    ? "rounded-full bg-rose-500 px-2 py-0.5 text-white"
                    : day.inCurrentMonth
                      ? "text-foreground"
                      : "text-muted"
                }`}
              >
                {day.dayNumber}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {day.rows.slice(0, 3).map((row) => (
                <button
                  key={row.slug}
                  type="button"
                  onClick={() => onRowSelect(row)}
                  className="app-panel-muted block w-full rounded-xl px-2.5 py-2 text-left text-xs text-foreground hover:border-white/30 hover:bg-white/[0.05]"
                >
                  <span className="block truncate font-medium">{row.title}</span>
                  <span className="mt-1 inline-flex">
                    <TrackerBadge
                      label={row.progress}
                      tone={getProgressTone(row.progress)}
                    />
                  </span>
                </button>
              ))}
              {day.rows.length > 3 ? (
                <p className="text-xs text-muted">+{day.rows.length - 3} more</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {!hasRowsThisMonth ? (
        <div className="px-4 py-5 text-sm text-muted sm:px-5">
          No solved problems this month.
        </div>
      ) : null}
    </div>
  );
}

export function ProblemTracker({ problems }: ProblemTrackerProps) {
  const [activeView, setActiveView] = useState<TrackerView>("main");
  const [entries, setEntries] = useState<Record<string, TrackerEntry>>(() =>
    createInitialTrackerEntries(problems),
  );
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfCalendarMonth(new Date()),
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draftEntry, setDraftEntry] = useState<TrackerEntry | null>(null);

  useEffect(() => {
    setEntries(loadTrackerEntries(problems));
  }, [problems]);

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSlug(null);
        setDraftEntry(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedSlug]);

  const rows = useMemo(
    () => buildTrackerRows(problems, entries),
    [entries, problems],
  );
  const selectedRow = useMemo(
    () => rows.find((row) => row.slug === selectedSlug) ?? null,
    [rows, selectedSlug],
  );

  function openEditor(row: TrackerRow) {
    setSelectedSlug(row.slug);
    setDraftEntry(entries[row.slug]);
  }

  function closeEditor() {
    setSelectedSlug(null);
    setDraftEntry(null);
  }

  function saveDraft() {
    if (!selectedSlug || !draftEntry) {
      return;
    }

    setEntries((currentEntries) => {
      const nextEntries = {
        ...currentEntries,
        [selectedSlug]: draftEntry,
      };

      saveTrackerEntries(nextEntries);
      return nextEntries;
    });
    closeEditor();
  }

  const progressGroups = useMemo(() => groupRowsByProgress(rows), [rows]);
  const difficultyGroups = useMemo(() => groupRowsByDifficulty(rows), [rows]);
  const reviewGroups = useMemo(() => groupRowsByReviewFrequency(rows), [rows]);

  return (
    <div className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8">
      <section className="space-y-5">
        {/* Tracker header card */}
        <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl flex flex-col gap-4 rounded-[2rem] px-5 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Problem Tracker
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                Track progress, review cadence, and solve history across the full problem set.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">{rows.length}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Tracked problems</span>
            </div>
          </div>

          {/* View tabs */}
          <div className="flex flex-wrap gap-2">
            {trackerViews.map((view) => {
              const active = activeView === view.key;
              return (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => setActiveView(view.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? "border-[#6dbf84]/40 bg-[linear-gradient(180deg,#86d39b_0%,#6dbf84_100%)] text-[#142018] shadow-[0_8px_20px_rgba(63,118,84,0.3)]"
                      : "border-white/10 bg-white/[0.04] text-muted hover:bg-white/[0.08] hover:text-foreground"
                  }`}
                >
                  <Icon name={view.icon as Parameters<typeof Icon>[0]["name"]} />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeView === "main" ? (
          <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <TrackerTable rows={rows} onRowSelect={openEditor} />
          </div>
        ) : null}

        {activeView === "progress" ? (
          <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl space-y-6 rounded-[2rem] px-5 py-5">
            {progressGroups.map((group) => (
              <GroupedTrackerSection
                key={group.key}
                label={group.label}
                count={group.count}
                tone={getProgressTone(group.key)}
                rows={group.rows}
                onRowSelect={openEditor}
              />
            ))}
          </div>
        ) : null}

        {activeView === "difficulty" ? (
          <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl space-y-6 rounded-[2rem] px-5 py-5">
            {difficultyGroups.map((group) => (
              <GroupedTrackerSection
                key={group.key}
                label={group.label}
                count={group.count}
                tone={
                  group.key === "Easy"
                    ? "easy"
                    : group.key === "Medium"
                      ? "medium"
                      : "hard"
                }
                rows={group.rows}
                onRowSelect={openEditor}
              />
            ))}
          </div>
        ) : null}

        {activeView === "revision" ? (
          <div className="border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl space-y-6 rounded-[2rem] px-5 py-5">
            {reviewGroups.map((group) => (
              <GroupedTrackerSection
                key={group.key}
                label={group.label}
                count={group.count}
                tone={getFrequencyTone(group.key)}
                rows={group.rows}
                onRowSelect={openEditor}
              />
            ))}
          </div>
        ) : null}

        {activeView === "solved_date" ? (
          <CalendarView
            monthDate={calendarMonth}
            rows={rows.filter((row) => row.dateSolved)}
            onPreviousMonth={() =>
              setCalendarMonth((currentMonth) =>
                shiftCalendarMonth(currentMonth, -1),
              )
            }
            onNextMonth={() =>
              setCalendarMonth((currentMonth) =>
                shiftCalendarMonth(currentMonth, 1),
              )
            }
            onCurrentMonth={() =>
              setCalendarMonth(startOfCalendarMonth(new Date()))
            }
            onRowSelect={openEditor}
          />
        ) : null}
      </section>

      {selectedRow && draftEntry ? (
        <TrackerDrawer
          row={selectedRow}
          draft={draftEntry}
          onClose={closeEditor}
          onSave={saveDraft}
          onChange={setDraftEntry}
        />
      ) : null}
    </div>
  );
}
