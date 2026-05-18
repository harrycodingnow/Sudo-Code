import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildCatalogSummary,
  resolveProblem,
} from "@/lib/ai/problem-context";
import { NAVIGATION_ASSISTANT_PROMPT } from "@/lib/ai/chat-policies";
import { getOpenAIClient } from "@/lib/ai/openai-client";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
  context: z
    .object({
      page: z.enum(["home", "problems", "tracker", "workspace"]).optional(),
      problemSlug: z.string().optional(),
    })
    .optional(),
  // Optional explicit context the workspace guide attaches to a turn so the
  // server can decide how to inject it. Previously the workspace smuggled
  // this in as a fake user message which made /api/chat's contract implicit.
  draftPseudocode: z.string().max(12000).optional(),
});

export async function POST(request: Request) {
  let parsed: z.infer<typeof chatRequestSchema>;
  try {
    parsed = chatRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Send a valid chat payload (messages: [{role, content}])." },
      { status: 400 },
    );
  }

  const openai = getOpenAIClient();
  if (!openai.ok) {
    return NextResponse.json({ error: openai.error }, { status: 500 });
  }

  const lastMessage = parsed.messages[parsed.messages.length - 1];
  if (lastMessage.role !== "user") {
    return NextResponse.json(
      { error: "The latest message must come from the user." },
      { status: 400 },
    );
  }

  // Full catalog so the assistant can recommend any problem — the old
  // hard-coded 24-cap silently hid the rest of the product catalog.
  const catalog = buildCatalogSummary();

  const pageHint = parsed.context?.page
    ? `User is currently on the ${parsed.context.page} page.`
    : "";
  const problem = resolveProblem(parsed.context?.problemSlug);
  const problemHint = problem
    ? `Active problem: ${problem.slug} (${problem.title}, ${problem.difficulty}).`
    : parsed.context?.problemSlug
      ? `Active problem: ${parsed.context.problemSlug}.`
      : "";

  const draft = parsed.draftPseudocode?.trim();
  const draftHint = draft
    ? `\n\nThe user's current pseudocode draft (context only — do NOT write code for them):\n${draft}`
    : "";

  try {
    const response = await openai.client.responses.create({
      model: openai.model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `${NAVIGATION_ASSISTANT_PROMPT}

Problem catalog:
${catalog}

${pageHint} ${problemHint}${draftHint}`.trim(),
            },
          ],
        },
        ...parsed.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    const reply = response.output_text?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "The assistant returned an empty reply. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: {
        id: `assistant-${Date.now()}`,
        role: "assistant" as const,
        content: reply,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting the assistant.",
      },
      { status: 500 },
    );
  }
}
