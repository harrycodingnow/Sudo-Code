import { z } from "zod";

export const reviewVerdictSchema = z.enum([
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
});

export type ReviewVerdict = z.infer<typeof reviewVerdictSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
