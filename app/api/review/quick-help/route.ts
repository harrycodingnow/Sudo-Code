import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

import {
  buildCompactProblemContext,
  resolveProblem,
} from "@/lib/ai/problem-context";
import { QUICK_HELP_RULES } from "@/lib/ai/chat-policies";
import { getOpenAIClient } from "@/lib/ai/openai-client";
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

    const isHint = result.data.mode === "hint";

    const response = await openai.client.responses.parse({
      model: openai.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: QUICK_HELP_RULES,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${buildCompactProblemContext(problem)}

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
        { error: "The assistant returned an unreadable quick reply. Try again." },
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
