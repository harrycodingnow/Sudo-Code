import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getProblemBySlug } from "@/lib/problems";
import {
  quickHelpRequestSchema,
  quickHelpResponseSchema,
} from "@/lib/review-schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = quickHelpRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Send a valid problem slug, quick-help mode, and one-line question.",
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
    const isHint = result.data.mode === "hint";

    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are a concise algorithm coach.

Reply with exactly one short line.
- Maximum 18 words.
- No bullets, no numbering, no code blocks.
- Keep the tone calm and specific.
- Never reveal the full solution.
- If mode is "hint", give only the next small nudge.
- If mode is "question", answer only the narrow question asked.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description: ${problem.description}

Candidate pseudocode:
${result.data.pseudocode || "(none yet)"}

Mode: ${isHint ? "quick hint" : "quick question"}
Prompt: ${result.data.question}

Return a single-line reply in {"answer":"..."} format.`,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(quickHelpResponseSchema, "quick_help"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        {
          error: "The assistant returned an unreadable quick reply. Try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      answer: response.output_parsed.answer.replace(/\s+/g, " ").trim(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while getting a quick reply.",
      },
      { status: 500 },
    );
  }
}
