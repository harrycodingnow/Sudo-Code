import type { Difficulty } from "@/types/problem";

const styles: Record<Difficulty, string> = {
  Easy: "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border border-amber-400/20 bg-amber-400/10 text-amber-300",
  Hard: "border border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
