import { trackerSeedMetadata } from "@/data/tracker-metadata";
import type { Difficulty, ProblemSummary } from "@/types/problem";
import type {
  TrackerCalendarDay,
  TrackerDifficultySummary,
  TrackerEntry,
  TrackerGroup,
  TrackerHomeSummary,
  TrackerProgressStatus,
  TrackerReviewFrequency,
  TrackerRow,
} from "@/types/tracker";
import { readJSON, STORAGE_KEYS, writeJSON } from "@/lib/browser-storage";

export const TRACKER_STORAGE_KEY = STORAGE_KEYS.tracker;

type RawTrackerStore = Record<string, unknown>;

function loadRawTrackerStore(): RawTrackerStore {
  const parsed = readJSON<RawTrackerStore | null>(TRACKER_STORAGE_KEY, null);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed;
}

export const TRACKER_PROGRESS_ORDER: TrackerProgressStatus[] = [
  "To Do",
  "In Progress",
  "Need Review",
  "Completed",
];

export const TRACKER_REVIEW_FREQUENCY_ORDER: TrackerReviewFrequency[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Once",
];

export const TRACKER_DIFFICULTY_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

function buildDefaultEntry(): TrackerEntry {
  return {
    progress: "To Do",
    reviewFrequency: "Weekly",
    timeSpentMinutes: null,
    dateSolved: null,
    language: "",
    companies: [],
    notes: "",
  };
}

function isProgressStatus(value: unknown): value is TrackerProgressStatus {
  return typeof value === "string" && TRACKER_PROGRESS_ORDER.includes(value as TrackerProgressStatus);
}

function isReviewFrequency(value: unknown): value is TrackerReviewFrequency {
  return (
    typeof value === "string" &&
    TRACKER_REVIEW_FREQUENCY_ORDER.includes(value as TrackerReviewFrequency)
  );
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clampString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitizeEntry(raw: unknown, fallback: TrackerEntry): TrackerEntry {
  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const candidate = raw as Partial<Record<keyof TrackerEntry, unknown>>;

  return {
    progress: isProgressStatus(candidate.progress)
      ? candidate.progress
      : fallback.progress,
    reviewFrequency: isReviewFrequency(candidate.reviewFrequency)
      ? candidate.reviewFrequency
      : fallback.reviewFrequency,
    timeSpentMinutes:
      typeof candidate.timeSpentMinutes === "number" &&
      Number.isFinite(candidate.timeSpentMinutes) &&
      candidate.timeSpentMinutes >= 0
        ? Math.round(candidate.timeSpentMinutes)
        : fallback.timeSpentMinutes,
    dateSolved: isIsoDate(candidate.dateSolved)
      ? candidate.dateSolved
      : fallback.dateSolved,
    language: clampString(candidate.language, 40),
    companies: Array.isArray(candidate.companies)
      ? candidate.companies
          .filter((company): company is string => typeof company === "string")
          .map((company) => company.trim())
          .filter(Boolean)
          .slice(0, 8)
      : fallback.companies,
    notes: clampString(candidate.notes, 500),
  };
}

function fallbackSourceUrl(slug: string) {
  return `https://leetcode.com/problems/${slug}/`;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createInitialTrackerEntries(
  problems: ProblemSummary[],
): Record<string, TrackerEntry> {
  return Object.fromEntries(
    problems.map((problem) => [problem.slug, buildDefaultEntry()]),
  );
}

export function loadTrackerEntries(
  problems: ProblemSummary[],
): Record<string, TrackerEntry> {
  const seededEntries = createInitialTrackerEntries(problems);

  const parsed = readJSON<Record<string, unknown> | null>(
    TRACKER_STORAGE_KEY,
    null,
  );
  if (!parsed) {
    return seededEntries;
  }

  return Object.fromEntries(
    problems.map((problem) => {
      const fallback = seededEntries[problem.slug];
      return [problem.slug, sanitizeEntry(parsed[problem.slug], fallback)];
    }),
  );
}

export function saveTrackerEntries(entries: Record<string, TrackerEntry>) {
  writeJSON(TRACKER_STORAGE_KEY, entries);
}

export function markTrackerEntryCompleted(
  problems: ProblemSummary[],
  slug: string,
  completedAt = new Date(),
) {
  const entries = loadTrackerEntries(problems);
  const currentEntry = entries[slug];

  if (!currentEntry) {
    return null;
  }

  const nextEntry: TrackerEntry = {
    ...currentEntry,
    progress: "Completed",
    dateSolved: currentEntry.dateSolved ?? toIsoDate(completedAt),
  };

  saveTrackerEntries({
    ...entries,
    [slug]: nextEntry,
  });

  return nextEntry;
}

/**
 * Slug-scoped tracker helpers — read/write a single problem's tracker entry
 * without requiring the caller to know the full problem list. Used by the
 * workspace page where we only have the active slug.
 *
 * These helpers preserve every other slug's stored entry unchanged (they
 * merge into the raw localStorage blob instead of rebuilding it from a
 * problems[] list).
 */
export function readTrackerEntryForSlug(slug: string): TrackerEntry | null {
  const raw = loadRawTrackerStore();
  if (!(slug in raw)) return null;
  return sanitizeEntry(raw[slug], buildDefaultEntry());
}

export function isTrackerSlugCompleted(slug: string): boolean {
  return readTrackerEntryForSlug(slug)?.progress === "Completed";
}

export function markTrackerSlugCompleted(
  slug: string,
  completedAt = new Date(),
): TrackerEntry {
  const raw = loadRawTrackerStore();
  const fallback = buildDefaultEntry();
  const current =
    slug in raw ? sanitizeEntry(raw[slug], fallback) : fallback;

  const nextEntry: TrackerEntry = {
    ...current,
    progress: "Completed",
    dateSolved: current.dateSolved ?? toIsoDate(completedAt),
  };

  writeJSON(TRACKER_STORAGE_KEY, { ...raw, [slug]: nextEntry });
  return nextEntry;
}

export function buildTrackerRows(
  problems: ProblemSummary[],
  entries: Record<string, TrackerEntry>,
): TrackerRow[] {
  return problems.map((problem, index) => {
    const metadata = trackerSeedMetadata[problem.slug];
    const entry = entries[problem.slug] ?? buildDefaultEntry();

    return {
      ...problem,
      ...entry,
      sortIndex: index,
      sourceUrl: metadata?.sourceUrl ?? fallbackSourceUrl(problem.slug),
      topicTags:
        metadata?.topicTags?.length > 0
          ? metadata.topicTags
          : problem.keyConcepts.slice(0, 3),
      timeComplexity: metadata?.timeComplexity ?? "O(?)",
      spaceComplexity: metadata?.spaceComplexity ?? "O(?)",
    };
  });
}

export function groupRowsByProgress(
  rows: TrackerRow[],
): TrackerGroup<TrackerProgressStatus>[] {
  return TRACKER_PROGRESS_ORDER.map((status) => ({
    key: status,
    label: status,
    count: rows.filter((row) => row.progress === status).length,
    rows: rows.filter((row) => row.progress === status),
  }));
}

export function groupRowsByDifficulty(
  rows: TrackerRow[],
): TrackerGroup<Difficulty>[] {
  return TRACKER_DIFFICULTY_ORDER.map((difficulty) => ({
    key: difficulty,
    label: difficulty,
    count: rows.filter((row) => row.difficulty === difficulty).length,
    rows: rows.filter((row) => row.difficulty === difficulty),
  }));
}

export function groupRowsByReviewFrequency(
  rows: TrackerRow[],
): TrackerGroup<TrackerReviewFrequency>[] {
  return TRACKER_REVIEW_FREQUENCY_ORDER.map((frequency) => ({
    key: frequency,
    label: frequency,
    count: rows.filter((row) => row.reviewFrequency === frequency).length,
    rows: rows.filter((row) => row.reviewFrequency === frequency),
  }));
}

export function buildTrackerHomeSummary(rows: TrackerRow[]): TrackerHomeSummary {
  const byDifficulty: TrackerDifficultySummary[] = TRACKER_DIFFICULTY_ORDER.map(
    (difficulty) => {
      const difficultyRows = rows.filter((row) => row.difficulty === difficulty);

      return {
        difficulty,
        solved: difficultyRows.filter((row) => row.progress === "Completed")
          .length,
        total: difficultyRows.length,
      };
    },
  );

  return {
    total: rows.length,
    solved: rows.filter((row) => row.progress === "Completed").length,
    attempting: rows.filter((row) => row.progress === "In Progress").length,
    byDifficulty,
  };
}

export function startOfCalendarMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function shiftCalendarMonth(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function getCalendarMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatSolvedDate(dateSolved: string | null) {
  if (!dateSolved) {
    return "—";
  }

  const parsed = new Date(`${dateSolved}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function buildCalendarDays(
  monthDate: Date,
  rows: TrackerRow[],
): TrackerCalendarDay[] {
  const monthStart = startOfCalendarMonth(monthDate);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rowsByDate = rows.reduce<Record<string, TrackerRow[]>>((groups, row) => {
    if (!row.dateSolved) {
      return groups;
    }

    const existingGroup = groups[row.dateSolved] ?? [];
    existingGroup.push(row);
    groups[row.dateSolved] = existingGroup.sort(
      (left, right) => left.sortIndex - right.sortIndex,
    );
    return groups;
  }, {});

  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + offset);
    date.setHours(0, 0, 0, 0);

    const isoDate = toIsoDate(date);

    return {
      isoDate,
      date,
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
      isToday: date.getTime() === today.getTime(),
      rows: rowsByDate[isoDate] ?? [],
    };
  });
}
