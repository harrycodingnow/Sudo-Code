import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

import {
  buildProblemContext,
  resolveProblem,
} from "@/lib/ai/problem-context";
import { reviewCoachingInstructions } from "@/lib/ai/chat-policies";
import { getOpenAIClient } from "@/lib/ai/openai-client";
import { reviewRequestSchema, reviewSchema } from "@/lib/review-schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = reviewRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Send a valid problem slug and pseudocode to request feedback.",
        },
        { status: 400 },
      );
    }

    const problem = resolveProblem(result.data.problemSlug);

    if (!problem) {
      return NextResponse.json(
        { error: "That problem could not be found." },
        { status: 404 },
      );
    }

    const openai = getOpenAIClient();
    if (!openai.ok) {
      return NextResponse.json({ error: openai.error }, { status: 500 });
    }

    const guideMode = result.data.reviewMode === "ai_guide";
    const coachingInstructions = reviewCoachingInstructions(guideMode);

    const response = await openai.client.responses.parse({
      model: openai.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are a calm technical interviewer reviewing algorithmic PSEUDOCODE — not source code.

Pseudocode-mode rules (hard):
- Judge the IDEA and CONTROL FLOW, not syntax. Do not flag missing variable initialization, missing return-type syntax, missing semicolons, missing 'def'/'function' keywords, or absent type annotations. Plain English steps are valid pseudocode.
- Do not invent steps the candidate did not write. If wording is ambiguous, prefer the most charitable reading.
- Distinguish pseudocode-level concerns (algorithmic correctness, invariants, data structure choice, traversal/update logic, edge cases) from implementation-level concerns (syntax, init, exact return form). Only report pseudocode-level concerns.

How to fill each field:
- summary: Talk DIRECTLY to the candidate as "you". 1–2 short, plain-English sentences. Open with a clear verdict the candidate can read in one glance — e.g. "You've basically got it,", "You're on the right track,", "This works,", "Not quite — ", "This won't work as written — ". Then ONE sentence on the single most important thing. No restating the algorithm, no jargon dump, no "the candidate". Write the way a senior dev would say it out loud over their shoulder. Examples of the tone:
  • "You've got the right idea — single-pass hash map. Just be explicit that you check the map BEFORE inserting, otherwise a value could match itself."
  • "This works. The only thing missing is what you return when no pair exists."
  • "Not quite — you're storing the wrong key. You want target − num as the key, not num itself."
- strengths: 1–4 concrete things you got RIGHT, addressed as "you" (e.g. "You picked the right data structure — hash map gives O(n) lookup.", "You correctly key by target − num."). Always include at least one if the approach is directionally sound. Mirror the tone of the summary.
- logic_issues: only ACTUAL correctness bugs in the stated algorithm, written to "you". De-duplicate aggressively — if two issues describe the same underlying mistake, collapse them into one item. Maximum 3.
- missing_steps: only steps whose absence would make the algorithm incorrect or non-terminating. Do not list polish steps here.
- clarifications: when a line is genuinely ambiguous, quote the candidate's EXACT line (verbatim, no paraphrase) in 'quote' and ask one short clarifying 'question' directed at "you". Use this — not logic_issues — when the concern is "I can't tell what you meant" rather than "this is wrong". Maximum 2.
- edge_cases: HIGH PRIORITY. List the specific inputs that would break or are worth confirming, phrased to "you" (e.g. "What about [2,2] with target=4 — does your map handle duplicate values?", "What if no valid pair exists?"). Put the most impactful edge case FIRST. These outrank stylistic suggestions; if you can only fit one piece of feedback, prefer an edge case over an improvement_suggestion.
- improvement_suggestions: stylistic / clarity polish only, addressed to "you". Keep to 0–2 items. Never duplicate something already in logic_issues, missing_steps, or edge_cases.
- time_complexity / space_complexity: short Big-O expressions only ("O(n)", "O(n) auxiliary"). Empty string if truly unclear.
- interviewer_followup: 0–3 short questions a real interviewer would ask next.

Voice rules (apply to every text field):
- Second person ("you", "your"). NEVER write "the candidate", "the solution", "the user".
- Short sentences. Plain words. Contractions OK ("you're", "won't", "doesn't").
- No corporate hedging ("it might be worth considering"). Just say it.
- No restating what the candidate wrote back to them at length.

Prefer short, direct phrases in arrays. Use empty arrays instead of filler text. Never repeat the same point across two different arrays.

${coachingInstructions}`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${buildProblemContext(problem)}

Candidate pseudocode:
${result.data.pseudocode}

Selected review mode: ${guideMode ? "AI Guide" : "Standard"}

Return structured feedback for this candidate.`,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(reviewSchema, "logic_review"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        { error: "The reviewer returned an unreadable response. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      review: response.output_parsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while reviewing that solution.",
      },
      { status: 500 },
    );
  }
}
