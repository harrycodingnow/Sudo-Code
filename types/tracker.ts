import type { Difficulty, ProblemSummary } from "@/types/problem";

export type TrackerProgressStatus =
  | "To Do"
  | "In Progress"
  | "Need Review"
  | "Completed";

export type TrackerReviewFrequency = "Daily" | "Weekly" | "Monthly" | "Once";

export type TrackerView =
  | "main"
  | "progress"
  | "difficulty"
  | "revision"
  | "solved_date";

export type TrackerEntry = {
  progress: TrackerProgressStatus;
  reviewFrequency: TrackerReviewFrequency;
  timeSpentMinutes: number | null;
  dateSolved: string | null;
  language: string;
  companies: string[];
  notes: string;
};

export type TrackerSeedMetadata = {
  sourceUrl?: string;
  topicTags: string[];
  timeComplexity: string;
  spaceComplexity: string;
  initialState?: Partial<TrackerEntry>;
};

export type TrackerRow = ProblemSummary &
  TrackerEntry & {
    sourceUrl: string;
    topicTags: string[];
    timeComplexity: string;
    spaceComplexity: string;
    sortIndex: number;
  };

export type TrackerGroup<T extends string> = {
  key: T;
  label: T;
  count: number;
  rows: TrackerRow[];
};

export type TrackerDifficultySummary = {
  difficulty: Difficulty;
  solved: number;
  total: number;
};

export type TrackerHomeSummary = {
  total: number;
  solved: number;
  attempting: number;
  byDifficulty: TrackerDifficultySummary[];
};

export type TrackerCalendarDay = {
  isoDate: string;
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  rows: TrackerRow[];
};

export type TrackerGroupingKey =
  | TrackerProgressStatus
  | Difficulty
  | TrackerReviewFrequency;
