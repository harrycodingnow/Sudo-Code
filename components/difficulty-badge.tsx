import type { Difficulty } from "@/types/problem";

import { cn } from "@/lib/cn";

const styles: Record<Difficulty, string> = {
  Easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Hard: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const dots: Record<Difficulty, string> = {
  Easy: "bg-emerald-300",
  Medium: "bg-amber-300",
  Hard: "bg-rose-300",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]",
        styles[difficulty],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[difficulty])} />
      {difficulty}
    </span>
  );
}
