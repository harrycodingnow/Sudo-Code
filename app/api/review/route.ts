import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getProblemBySlug } from "@/lib/problems";
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

    const problem = getProblemBySlug(result.data.problemSlug);

    if (!problem) {
      return NextResponse.json(
        {
          error: "That problem could not be found.",
        },
        { status: 404 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to your environment before requesting feedback.",
        },
        { status: 500 },
      );
    }

    const client = new OpenAI({ apiKey });
    const guideMode = result.data.reviewMode === "ai_guide";
    const coachingInstructions = guideMode
      ? `Coaching style:
- Never give the answer directly. Ask guiding questions instead.
- Break problems into tiny steps.
- Validate what is right, then correct what is wrong without discouraging.
- Let the candidate write the code themselves, then fix mistakes incrementally.
- Use trace-throughs to solidify understanding.
- Do not reveal the complete corrected algorithm, full code, or polished pseudocode.
- In the summary and arrays, prefer short questions, prompts, and next-step nudges over declarative answers.`
      : `Response style:
- Be direct about what is correct, incomplete, or incorrect.
- Prefer concise, concrete statements over hints.
- You may state the missing step explicitly when it materially improves the feedback.`;

    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
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
              text: `Problem context:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.examples)}
Constraints: ${JSON.stringify(problem.constraints)}
Key concepts: ${JSON.stringify(problem.keyConcepts)}

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
        {
          error: "The reviewer returned an unreadable response. Try again.",
        },
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
