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
              text: `You are a calm technical interviewer reviewing algorithmic pseudocode.

Your job:
- Evaluate the logic of the candidate's approach, not syntax.
- Be tolerant of informal pseudocode wording and infer intent when it is reasonable.
- Penalize missing steps, weak invariants, wrong data structures, or incomplete traversal/update logic.
- Keep feedback concise, useful, and fair.
- Do not hallucinate steps that are not implied by the candidate's answer.
- If the candidate is directionally right but underspecified, use "partially_correct".
- Prefer short, direct phrases in arrays. Use empty arrays instead of filler text.

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
      feedback: response.output_parsed,
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
