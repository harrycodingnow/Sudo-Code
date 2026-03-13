import type { Difficulty } from "@/types/problem";

const styles: Record<Difficulty, string> = {
  Easy: "border-emerald-700/20 bg-emerald-100 text-emerald-800",
  Medium: "border-amber-700/20 bg-amber-100 text-amber-800",
  Hard: "border-rose-700/20 bg-rose-100 text-rose-800",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
