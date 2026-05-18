import { getProblemBySlug, getProblemSummaries } from "@/lib/problems";
import type { ProblemSummary } from "@/types/problem";

/**
 * Shared helpers for turning a problem slug (or the whole catalog) into
 * the structured text we feed every coaching/review/chat prompt.
 *
 * Keeping this in one place fixes the historical drift where each
 * /api/review/* route and /api/chat built its own context blob.
 */

export type ResolvedProblem = NonNullable<ReturnType<typeof getProblemBySlug>>;

export function resolveProblem(slug: string | null | undefined): ResolvedProblem | null {
  if (!slug) return null;
  return getProblemBySlug(slug) ?? null;
}

/** Full problem context (description, examples, constraints, key concepts). */
export function buildProblemContext(problem: ResolvedProblem): string {
  return `Problem context:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.examples)}
Constraints: ${JSON.stringify(problem.constraints)}
Key concepts: ${JSON.stringify(problem.keyConcepts)}`;
}

/** Compact problem context for routes that only need title/difficulty/desc. */
export function buildCompactProblemContext(problem: ResolvedProblem): string {
  return `Problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Description: ${problem.description}`;
}

/**
 * Catalog summaries rendered as a compact bullet list the chat assistant can
 * scan when recommending problems. Returns ALL summaries by default — callers
 * that need to truncate can do so explicitly with a `limit` rather than
 * silently dropping problems past a hard-coded index.
 */
export function buildCatalogSummary(options: { limit?: number } = {}): string {
  const { limit } = options;
  let summaries: ProblemSummary[] = getProblemSummaries();
  if (typeof limit === "number" && limit > 0) {
    summaries = summaries.slice(0, limit);
  }
  return summaries
    .map(
      (p) =>
        `- ${p.title} [${p.difficulty}, ${p.category}] -> /problems/${p.slug}`,
    )
    .join("\n");
}
