import type { Difficulty } from "@/types/problem";

const styles: Record<Difficulty, string> = {
  Easy:   "bg-emerald-500/90 text-white shadow-[0_2px_8px_rgba(52,211,153,0.35)]",
  Medium: "bg-amber-500/90 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)]",
  Hard:   "bg-rose-500/90 text-white shadow-[0_2px_8px_rgba(244,63,94,0.35)]",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
