import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProblemBySlug } from "@/lib/problems";
import {
  guideMessageRequestSchema,
  guideMessageResponseSchema,
  guideMessageSchema,
  guideStartRequestSchema,
  guideStartResponseSchema,
} from "@/lib/review-schema";

const guideOpeningOutputSchema = z.object({
  message: z.string().trim().min(1).max(240),
});

const guideReplyOutputSchema = z.object({
  message: z.string().trim().min(1).max(360),
});

function normalizeLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeNullableLine(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = normalizeLine(value);
  return normalized.length > 0 ? normalized : null;
}

function buildProblemContext(
  problem: NonNullable<ReturnType<typeof getProblemBySlug>>,
) {
  return `Problem context:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.examples)}
Constraints: ${JSON.stringify(problem.constraints)}
Key concepts: ${JSON.stringify(problem.keyConcepts)}`;
}

function formatTranscript(messages: z.infer<typeof guideMessageSchema>[]) {
  return messages
    .map((message) => {
      const speaker = message.role === "assistant" ? "Assistant" : "User";
      return `${speaker}: ${message.content}`;
    })
    .join("\n");
}

const guideCoachingRules = `You are an expert coding interview coach using the Socratic method.

Goal:
- Help the user solve LeetCode-style problems themselves.
- Never give the full solution outright.
- If the user asks for the answer directly, give at most pseudocode skeleton or a guiding question.
- Keep the conversation moving one step at a time.

Coaching rules:
- Validate what is right before pointing out errors.
- Point out at most 1-2 critical issues at a time.
- If the user is stuck, break the problem into the smallest possible next step.
- After a correct solution, offer to trace a concrete example step by step.
- After a working solution, ask about time and space complexity.
- Use encouraging language like "You're close!" or "Exactly!".
- Never reveal the data structure or algorithm to use.
- Ask questions that lead the user to choose it themselves.
- Keep replies concise and focused.
- Do not add edge cases, caveats, or extra considerations unless the user asked about them or they are necessary to correct the user's current statement.
- Do not volunteer multiple ideas in one reply.
- Do not reveal the full solution, full algorithm, or complete code.`;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = guideStartRequestSchema.safeParse(json);

    if (!result.success) {
      const messageResult = guideMessageRequestSchema.safeParse(json);

      if (!messageResult.success) {
        return NextResponse.json(
          {
            error:
              "Send a valid guide action, problem slug, pseudocode, and chat payload.",
          },
          { status: 400 },
        );
      }

      const problem = getProblemBySlug(messageResult.data.problemSlug);

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
              "OPENAI_API_KEY is missing. Add it to your environment before requesting guide replies.",
          },
          { status: 500 },
        );
      }

      const messages = messageResult.data.messages;
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || lastMessage.role !== "user") {
        return NextResponse.json(
          {
            error: "The latest guide message must come from the user.",
          },
          { status: 400 },
        );
      }

      const client = new OpenAI({ apiKey });
      const problemContext = buildProblemContext(problem);
      const draftText = messageResult.data.pseudocode.trim()
        ? messageResult.data.pseudocode
        : "(none yet)";

      const response = await client.responses.parse({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `${guideCoachingRules}

Chat behavior:
- Continue the conversation naturally.
- Respond with exactly one assistant message.
- After validating the user's answer, ask ONE guiding question only.
- Keep the reply to 1-2 short sentences total.
- Sentence 1: briefly validate or correct the user's exact point.
- Sentence 2: ask one focused next-step question.
- Never explain the next step, just prompt the user to think of it themselves.
- Never reveal the data structure or algorithm to use.
- Ask questions that lead the user to choose it themselves.
- Do not list edge cases, constraints, or implementation details unless the user brought them up or they are required to fix the user's current reasoning.
- If the user says "I don't know", "not sure", or otherwise signals uncertainty, do not reveal the answer or code. Ask one smaller question about the immediate concept, ideally a yes/no question or a fill-in-the-blank prompt.
- If the user is stuck, ask about the next smallest decision.
- Do not turn a guiding question into code or pseudocode in the reply.
- Use the candidate's pseudocode and the prior chat to stay specific.`,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${problemContext}

Candidate pseudocode:
${draftText}

Chat transcript:
${formatTranscript(messages)}

Latest user message:
${lastMessage.content}

Return the next assistant message in JSON.`,
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(guideReplyOutputSchema, "guide_reply"),
        },
      });

      if (!response.output_parsed) {
        return NextResponse.json(
          {
            error: "The guide returned an unreadable reply. Try again.",
          },
          { status: 502 },
        );
      }

      const message = guideMessageSchema.parse({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: normalizeLine(response.output_parsed.message),
      });

      return NextResponse.json(
        guideMessageResponseSchema.parse({
          message,
        }),
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

    const fixedQuestion = normalizeNullableLine(problem.initialGuideQuestion);

    if (fixedQuestion) {
      return NextResponse.json(
        guideStartResponseSchema.parse({
          message: {
            id: "guide-start",
            role: "assistant",
            content: fixedQuestion,
          },
        }),
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Add it to your environment before requesting guide questions.",
        },
        { status: 500 },
      );
    }

    const client = new OpenAI({ apiKey });
    const problemContext = buildProblemContext(problem);
    const draftText = result.data.pseudocode.trim()
      ? result.data.pseudocode
      : "(none yet)";

    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `${guideCoachingRules}

Opening behavior:
- Return exactly one short opening message.
- Never explain the answer or suggest the tool/algorithm name.
- Ask one focused question only.
- If no pseudocode is provided, begin with the most foundational strategy question.
- If pseudocode exists, identify the biggest logical gap and ask about that gap first.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${problemContext}

Candidate pseudocode:
${draftText}

Return the first assistant message in JSON.`,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(guideOpeningOutputSchema, "guide_opening"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        {
          error: "The guide returned an unreadable first message. Try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      guideStartResponseSchema.parse({
        message: {
          id: "guide-start",
          role: "assistant",
          content: normalizeLine(response.output_parsed.message),
        },
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while continuing the guide.",
      },
      { status: 500 },
    );
  }
}
