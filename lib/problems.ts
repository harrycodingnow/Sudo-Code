import { problems } from "@/data/problems";
import type { ProblemSummary } from "@/types/problem";

export function getProblemBySlug(slug: string) {
  return problems.find((problem) => problem.slug === slug);
}

export function getProblemSummaries(): ProblemSummary[] {
  return problems.map((problem) => ({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    category: problem.category,
    keyConcepts: problem.keyConcepts,
  }));
}
