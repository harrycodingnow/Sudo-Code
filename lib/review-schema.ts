import { z } from "zod";

export const reviewVerdictSchema = z.enum([
  "correct",
  "partially_correct",
  "incorrect",
]);

export const reviewModeSchema = z.enum(["standard", "ai_guide"]);
export const quickHelpModeSchema = z.enum(["question", "hint"]);

export const reviewSchema = z.object({
  verdict: reviewVerdictSchema,
  summary: z.string(),
  missing_steps: z.array(z.string()),
  logic_issues: z.array(z.string()),
  edge_cases: z.array(z.string()),
  time_complexity: z.string(),
  space_complexity: z.string(),
  improvement_suggestions: z.array(z.string()),
  interviewer_followup: z.array(z.string()),
});

export const reviewRequestSchema = z.object({
  problemSlug: z.string().min(1),
  pseudocode: z.string().trim().min(1).max(12000),
  reviewMode: reviewModeSchema.default("standard"),
});

export const quickHelpRequestSchema = z.object({
  problemSlug: z.string().min(1),
  pseudocode: z.string().max(12000).default(""),
  mode: quickHelpModeSchema,
  question: z.string().trim().min(1).max(200),
});

export const quickHelpResponseSchema = z.object({
  answer: z.string(),
});

export type ReviewVerdict = z.infer<typeof reviewVerdictSchema>;
export type ReviewMode = z.infer<typeof reviewModeSchema>;
export type QuickHelpMode = z.infer<typeof quickHelpModeSchema>;
export type FeedbackPanelMode = ReviewMode | "quick_question";
export type Review = z.infer<typeof reviewSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export type QuickHelpRequest = z.infer<typeof quickHelpRequestSchema>;
export type QuickHelpResponse = z.infer<typeof quickHelpResponseSchema>;
