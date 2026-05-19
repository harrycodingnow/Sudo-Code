import { z } from "zod";

export const reviewVerdictSchema = z.enum([
  "correct",
  "partially_correct",
  "incorrect",
]);

export const reviewModeSchema = z.enum(["standard", "ai_guide"]);
export const quickHelpModeSchema = z.enum(["question", "hint"]);
export const guideMessageRoleSchema = z.enum(["user", "assistant"]);

export const guideMessageSchema = z.object({
  id: z.string().min(1),
  role: guideMessageRoleSchema,
  content: z.string().trim().min(1).max(1000),
});

export const reviewClarificationSchema = z.object({
  quote: z.string(),
  question: z.string(),
});

export const reviewSchema = z.object({
  verdict: reviewVerdictSchema,
  summary: z.string(),
  strengths: z.array(z.string()),
  missing_steps: z.array(z.string()),
  logic_issues: z.array(z.string()),
  clarifications: z.array(reviewClarificationSchema),
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

export const guideStartResponseSchema = z.object({
  message: guideMessageSchema,
});

export const guideMessageResponseSchema = z.object({
  message: guideMessageSchema,
});

const guideRequestBaseSchema = z.object({
  problemSlug: z.string().min(1),
  pseudocode: z.string().max(12000).default(""),
});

export const guideStartRequestSchema = guideRequestBaseSchema.extend({
  action: z.literal("start"),
});

export const guideMessageRequestSchema = guideRequestBaseSchema.extend({
  action: z.literal("message"),
  messages: z.array(guideMessageSchema).min(1),
});

export const guideRequestSchema = z.discriminatedUnion("action", [
  guideStartRequestSchema,
  guideMessageRequestSchema,
]);

export type ReviewVerdict = z.infer<typeof reviewVerdictSchema>;
export type ReviewMode = z.infer<typeof reviewModeSchema>;
export type QuickHelpMode = z.infer<typeof quickHelpModeSchema>;
export type GuideMessageRole = z.infer<typeof guideMessageRoleSchema>;
export type GuideMessage = z.infer<typeof guideMessageSchema>;
export type FeedbackPanelMode = ReviewMode;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export type QuickHelpRequest = z.infer<typeof quickHelpRequestSchema>;
export type QuickHelpResponse = z.infer<typeof quickHelpResponseSchema>;
export type GuideStartResponse = z.infer<typeof guideStartResponseSchema>;
export type GuideMessageResponse = z.infer<typeof guideMessageResponseSchema>;
export type GuideRequest = z.infer<typeof guideRequestSchema>;
