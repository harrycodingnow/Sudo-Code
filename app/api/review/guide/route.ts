import { zodTextFormat } from "openai/helpers/zod";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProblemBySlug } from "@/lib/problems";
import {
  guideAnswerVerdictSchema,
  guideRequestSchema,
  guideSessionResponseSchema,
} from "@/lib/review-schema";

const fixedInitialGuideQuestions: Record<string, string> = {
  "two-sum":
    "What would a brute-force solution look like - and what's slow about it?",
  "valid-parentheses":
    "If you were checking this by hand, what information would you need to remember as you read each character?",
  "merge-two-sorted-lists":
    "Walk me through this example step by step: [1,3,5] and [2,4,6]. At each step, how do you decide which node comes next?",
  "best-time-to-buy-and-sell-stock":
    "If you're standing at day 5, what's the only thing you need to know about the days before it to make the best decision?",
  "binary-search":
    "What property of the array makes it possible to rule out half the elements at each step?",
  "maximum-depth-of-binary-tree":
    "How would you define the depth of a node in terms of its children's depths?",
  "binary-tree-level-order-traversal":
    "If you had to visit all nodes level by level, what information would you need to track to know when one level ends and the next begins?",
  "top-k-frequent-elements":
    "Once you know each element's frequency, how would you find the top K - and what's the cost of doing it naively?",
  "lru-cache":
    "What two operations does this cache need to support, and what time complexity does the problem require for each?",
  "number-of-islands":
    "How would you describe which cells belong to the same island - and how does that translate into a graph problem?",
};

const guideStartOutputSchema = z.object({
  currentQuestion: z.string().trim().min(1).max(160),
});

const guideAnswerOutputSchema = z.object({
  verdict: guideAnswerVerdictSchema,
  feedback: z.string().trim().min(1).max(240),
  queuedNextQuestion: z.string().trim().min(1).max(160).nullable(),
  completed: z.boolean(),
});

const guideRevealOutputSchema = z.object({
  revealedAnswer: z.string().trim().min(1).max(240),
  feedback: z.string().trim().min(1).max(240),
  queuedNextQuestion: z.string().trim().min(1).max(160).nullable(),
  completed: z.boolean(),
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

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = guideRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            "Send a valid guide action, problem slug, and guide payload.",
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

    if (result.data.action === "start") {
      const fixedQuestion = fixedInitialGuideQuestions[problem.slug];

      if (fixedQuestion) {
        const session = guideSessionResponseSchema.parse({
          currentQuestion: normalizeLine(fixedQuestion),
          currentAnswer: null,
          verdict: null,
          feedback: null,
          attemptCount: 0,
          revealedAnswer: null,
          queuedNextQuestion: null,
          canAdvance: false,
          completed: false,
        });

        return NextResponse.json({ session });
      }
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

    if (result.data.action === "start") {
      const response = await client.responses.parse({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `You are a calm algorithm interview coach.

Return exactly one first guide question.
- Never reveal the full solution, the full algorithm, or any complete code.
- Ask one short, direct question in a single sentence.
- Maximum 16 words.
- Do not use parentheticals, semicolons, or multi-part questions.
- Focus on exactly one decision or missing detail.
- If no pseudocode is provided, start from the most foundational strategy or data-structure question.
- If pseudocode exists, identify the single biggest logical gap and ask about that gap first.
- Ask only one question.`,
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

Return the first guide question in JSON.`,
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(guideStartOutputSchema, "guide_start"),
        },
      });

      if (!response.output_parsed) {
        return NextResponse.json(
          {
            error: "The guide returned an unreadable first question. Try again.",
          },
          { status: 502 },
        );
      }

      const session = guideSessionResponseSchema.parse({
        currentQuestion: normalizeLine(response.output_parsed.currentQuestion),
        currentAnswer: null,
        verdict: null,
        feedback: null,
        attemptCount: 0,
        revealedAnswer: null,
        queuedNextQuestion: null,
        canAdvance: false,
        completed: false,
      });

      return NextResponse.json({ session });
    }

    if (result.data.action === "answer") {
      const currentQuestion = normalizeLine(result.data.session.currentQuestion);
      const answer = normalizeLine(result.data.answer);

      const response = await client.responses.parse({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `You are a calm algorithm interview coach continuing a guide card.

Evaluate the candidate's latest answer to the current guide question.
- Never reveal the full solution, the full algorithm, or complete code.
- "correct" means the answer is sufficient for the current question.
- "partially_correct" means some of the idea is right but a key detail is missing.
- "incorrect" means the answer points in the wrong direction.
- feedback must be one short coaching line.
- If you provide queuedNextQuestion, it must be one short direct sentence.
- queuedNextQuestion must be at most 16 words.
- Do not use parentheticals, semicolons, or multi-part questions.
- If the answer is correct, provide the next dependency question in queuedNextQuestion, unless the candidate has enough guidance to continue alone, in which case set completed to true.
- If the answer is partially correct or incorrect, keep queuedNextQuestion null and set completed to false.
- Do not replace the current question on partially correct or incorrect answers.
- Ask at most one queued next question.`,
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

Current guide card:
${JSON.stringify(result.data.session)}

Current question:
${currentQuestion}

Candidate answer:
${answer}

Return the evaluation in JSON.`,
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(guideAnswerOutputSchema, "guide_answer"),
        },
      });

      if (!response.output_parsed) {
        return NextResponse.json(
          {
            error: "The guide returned an unreadable answer evaluation. Try again.",
          },
          { status: 502 },
        );
      }

      const parsed = response.output_parsed;
      const isResolved = parsed.verdict === "correct";
      const queuedNextQuestion =
        isResolved && !parsed.completed
          ? normalizeNullableLine(parsed.queuedNextQuestion)
          : null;

      if (isResolved && !parsed.completed && !queuedNextQuestion) {
        return NextResponse.json(
          {
            error: "The guide did not provide a next question. Try again.",
          },
          { status: 502 },
        );
      }

      const session = guideSessionResponseSchema.parse({
        currentQuestion,
        currentAnswer: answer,
        verdict: parsed.verdict,
        feedback: normalizeLine(parsed.feedback),
        attemptCount: result.data.session.attemptCount + 1,
        revealedAnswer: null,
        queuedNextQuestion,
        canAdvance: Boolean(queuedNextQuestion),
        completed: parsed.completed,
      });

      return NextResponse.json({ session });
    }

    const currentQuestion = normalizeLine(result.data.session.currentQuestion);

    if (result.data.session.attemptCount < 1) {
      return NextResponse.json(
        {
          error: "Answer the current guide question first before revealing it.",
        },
        { status: 400 },
      );
    }

    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are a calm algorithm interview coach revealing a single guide answer.

Return the concise expected answer for the current guide question only.
- Never reveal the full solution, the full algorithm, or any complete code.
- revealedAnswer must answer only the current question.
- feedback must be one short line.
- If there is a natural next dependency question, provide it in queuedNextQuestion as one short direct sentence.
- queuedNextQuestion must be at most 16 words.
- Do not use parentheticals, semicolons, or multi-part questions.
- If the candidate now has enough guidance to continue alone, set completed to true and queuedNextQuestion to null.
- Ask at most one queued next question.`,
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

Current guide card:
${JSON.stringify(result.data.session)}

Current question:
${currentQuestion}

Return the revealed answer in JSON.`,
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(guideRevealOutputSchema, "guide_reveal"),
      },
    });

    if (!response.output_parsed) {
      return NextResponse.json(
        {
          error: "The guide returned an unreadable revealed answer. Try again.",
        },
        { status: 502 },
      );
    }

    const parsed = response.output_parsed;
    const queuedNextQuestion = parsed.completed
      ? null
      : normalizeNullableLine(parsed.queuedNextQuestion);

    if (!parsed.completed && !queuedNextQuestion) {
      return NextResponse.json(
        {
          error: "The guide did not provide a next question. Try again.",
        },
        { status: 502 },
      );
    }

    const revealedAnswer = normalizeLine(parsed.revealedAnswer);
    const session = guideSessionResponseSchema.parse({
      currentQuestion,
      currentAnswer: revealedAnswer,
      verdict: result.data.session.verdict,
      feedback: normalizeLine(parsed.feedback),
      attemptCount: result.data.session.attemptCount,
      revealedAnswer,
      queuedNextQuestion,
      canAdvance: Boolean(queuedNextQuestion),
      completed: parsed.completed,
    });

    return NextResponse.json({ session });
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
