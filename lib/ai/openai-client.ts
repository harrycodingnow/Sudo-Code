import OpenAI from "openai";

/**
 * Shared OpenAI client + model selection for every server-side AI route.
 *
 * Centralizing this means:
 * - one place to set the default model / read OPENAI_MODEL,
 * - one place to enforce the apiKey presence check shape,
 * - one place to add things like timeouts, retries, or telemetry later.
 */

export type OpenAIClientResult =
  | { ok: true; client: OpenAI; model: string }
  | { ok: false; error: string };

const DEFAULT_MODEL = "gpt-5-mini";

export function getOpenAIClient(): OpenAIClientResult {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "OPENAI_API_KEY is missing. Add it to your environment before using AI features.",
    };
  }
  return {
    ok: true,
    client: new OpenAI({ apiKey }),
    model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
  };
}
