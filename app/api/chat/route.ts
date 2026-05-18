import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProblemSummaries } from "@/lib/problems";

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
});

const SYSTEM_PROMPT = `You are SudoCode's onboarding companion — a friendly, concise assistant who lives in the corner of every page.

Your job:
- Help the user navigate the app: Home (/), Problems catalog (/problems), Practice tracker (/tracker), and individual problem workspaces at /problems/<slug>.
- Explain features when asked: pseudocode-first editor, AI logic validator, inline chat guide on each problem, kanban tracker (To Do → In Progress → Need Review → Completed), filter bar on /problems.
- Answer general data-structures-and-algorithms questions at a high, conceptual level.
- Suggest a relevant problem from the catalog when the user expresses interest in a topic.
- If the user is on a specific problem and asks for hints, use the Socratic method: never give the full algorithm or code; ask one guiding question at a time.

Style:
- Keep replies short — 1 to 3 sentences for navigation/feature answers, up to ~5 for concept explanations.
- Plain text. Use \`backticks\` only for code/file/path tokens. No long markdown.
- When pointing the user at a page, write the path in backticks like \`/problems\` so the UI can render it nicely.
- Encouraging tone, terminal/hacker vibe is fine but never cringey.
- If you don't know something app-specific, say so honestly.`;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing. Add it to your environment before using the chatbot.",
      },
      { status: 500 },
    );
  }

  const lastMessage = parsed.messages[parsed.messages.length - 1];
  if (lastMessage.role !== "user") {
    return NextResponse.json(
      { error: "The latest message must come from the user." },
      { status: 400 },
    );
  }

  // Compact catalog context so the model can recommend real problems.
  const catalog = getProblemSummaries()
    .slice(0, 24)
    .map(
      (p) =>
        `- ${p.title} [${p.difficulty}, ${p.category}] -> /problems/${p.slug}`,
    )
    .join("\n");

  const pageHint = parsed.context?.page
    ? `User is currently on the ${parsed.context.page} page.`
    : "";
  const problemHint = parsed.context?.problemSlug
    ? `Active problem: ${parsed.context.problemSlug}.`
    : "";

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `${SYSTEM_PROMPT}

Problem catalog (first 24):
${catalog}

${pageHint} ${problemHint}`.trim(),
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
