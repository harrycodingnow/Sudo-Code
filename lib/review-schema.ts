import { z } from "zod";

export const reviewVerdictSchema = z.enum([
  "correct",
  "partially_correct",
  "incorrect",
]);

export const reviewModeSchema = z.enum(["standard", "ai_guide"]);
export const quickHelpModeSchema = z.enum(["question", "hint"]);
export const guideAnswerVerdictSchema = z.enum([
  "correct",
  "partially_correct",
  "incorrect",
]);

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

const guideQuestionSchema = z.string().trim().min(1).max(160);
const guideAnswerSchema = z.string().trim().min(1).max(500);

export const guideSessionResponseSchema = z.object({
  currentQuestion: guideQuestionSchema,
  currentAnswer: guideAnswerSchema.nullable(),
  verdict: guideAnswerVerdictSchema.nullable(),
  feedback: z.string().trim().min(1).max(240).nullable(),
  attemptCount: z.number().int().min(0),
  revealedAnswer: z.string().trim().min(1).max(240).nullable(),
  queuedNextQuestion: guideQuestionSchema.nullable(),
  canAdvance: z.boolean(),
  completed: z.boolean(),
});

const guideRequestBaseSchema = z.object({
  problemSlug: z.string().min(1),
  pseudocode: z.string().max(12000).default(""),
});

export const guideStartRequestSchema = guideRequestBaseSchema.extend({
  action: z.literal("start"),
});

export const guideAnswerRequestSchema = guideRequestBaseSchema.extend({
  action: z.literal("answer"),
  session: guideSessionResponseSchema,
  answer: guideAnswerSchema,
});

export const guideRevealRequestSchema = guideRequestBaseSchema.extend({
  action: z.literal("reveal"),
  session: guideSessionResponseSchema,
});

export const guideRequestSchema = z.discriminatedUnion("action", [
  guideStartRequestSchema,
  guideAnswerRequestSchema,
  guideRevealRequestSchema,
]);

export type ReviewVerdict = z.infer<typeof reviewVerdictSchema>;
export type ReviewMode = z.infer<typeof reviewModeSchema>;
export type QuickHelpMode = z.infer<typeof quickHelpModeSchema>;
export type GuideAnswerVerdict = z.infer<typeof guideAnswerVerdictSchema>;
export type FeedbackPanelMode = ReviewMode | "quick_question";
export type Review = z.infer<typeof reviewSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export type QuickHelpRequest = z.infer<typeof quickHelpRequestSchema>;
export type QuickHelpResponse = z.infer<typeof quickHelpResponseSchema>;
export type GuideSessionResponse = z.infer<typeof guideSessionResponseSchema>;
export type GuideRequest = z.infer<typeof guideRequestSchema>;
