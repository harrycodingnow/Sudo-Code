"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  TRACKER_PROGRESS_ORDER,
  buildTrackerHomeSummary,
  buildTrackerRows,
  createInitialTrackerEntries,
  formatSolvedDate,
  groupRowsByProgress,
  loadTrackerEntries,
  saveTrackerEntries,
} from "@/lib/tracker";
import type { ProblemSummary } from "@/types/problem";
import type {
  TrackerEntry,
  TrackerProgressStatus,
  TrackerRow,
} from "@/types/tracker";

type Props = { problems: ProblemSummary[] };

const STATUS_META: Record<
  TrackerProgressStatus,
  { color: string; icon: string }
> = {
  "To Do": { color: "var(--fg-faint)", icon: "·" },
  "In Progress": { color: "var(--blue)", icon: "▸" },
  "Need Review": { color: "var(--amber)", icon: "!" },
  Completed: { color: "var(--accent)", icon: "✓" },
};

export function LabTracker({ problems }: Props) {
  const [entries, setEntries] = useState<Record<string, TrackerEntry>>(() =>
    createInitialTrackerEntries(problems),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(loadTrackerEntries(problems));
    setHydrated(true);
  }, [problems]);

  const rows = useMemo(
    () => buildTrackerRows(problems, entries),
    [problems, entries],
  );
  const summary = useMemo(() => buildTrackerHomeSummary(rows), [rows]);
  const groups = useMemo(() => groupRowsByProgress(rows), [rows]);

  const cycleStatus = (slug: string) => {
    setEntries((prev) => {
      const cur = prev[slug];
      if (!cur) return prev;
      const idx = TRACKER_PROGRESS_ORDER.indexOf(cur.progress);
      const next =
        TRACKER_PROGRESS_ORDER[(idx + 1) % TRACKER_PROGRESS_ORDER.length];
      const updated: TrackerEntry = {
        ...cur,
        progress: next,
        dateSolved:
          next === "Completed"
            ? cur.dateSolved ?? new Date().toISOString().slice(0, 10)
            : cur.dateSolved,
      };
      const out = { ...prev, [slug]: updated };
      saveTrackerEntries(out);
      return out;
    });
  };

  const percent =
    summary.total === 0 ? 0 : Math.round((summary.solved / summary.total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* summary strip */}
      <section
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "minmax(0, 1.5fr) repeat(3, minmax(0, 1fr))",
        }}
      >
        <div className="pl-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p className="pl-label">overall progress</p>
            <span
              style={{
                fontFamily:
                  "var(--font-dm-mono), ui-monospace, monospace",
                fontSize: "11px",
                color: "var(--accent)",
              }}
            >
              {percent}%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
              fontFamily:
                "var(--font-dm-mono), ui-monospace, monospace",
            }}
          >
            <span
              style={{
                fontSize: "30px",
                fontWeight: 600,
                color: "var(--fg)",
                letterSpacing: "-0.02em",
              }}
            >
              {summary.solved}
            </span>
            <span style={{ color: "var(--fg-faint)", fontSize: "14px" }}>
              / {summary.total} solved
            </span>
          </div>
          <div className="pl-progress-track">
            <div
              className="pl-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {summary.byDifficulty.map((d) => {
          const color =
            d.difficulty === "Easy"
              ? "var(--accent)"
              : d.difficulty === "Medium"
                ? "var(--amber)"
                : "var(--red)";
          const pct = d.total === 0 ? 0 : Math.round((d.solved / d.total) * 100);
          return (
            <div key={d.difficulty} className="pl-card">
              <p className="pl-label">{d.difficulty.toLowerCase()}</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  fontFamily:
                    "var(--font-dm-mono), ui-monospace, monospace",
                }}
              >
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color,
                  }}
                >
                  {d.solved}
                </span>
                <span style={{ color: "var(--fg-faint)", fontSize: "12px" }}>
                  / {d.total}
                </span>
              </div>
              <div className="pl-progress-track">
                <div
                  className="pl-progress-fill"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* kanban columns */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div>
            <p className="pl-page-eyebrow">{"// status board"}</p>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Track every attempt
            </h2>
          </div>
          {!hydrated && (
            <span
              style={{
                fontFamily:
                  "var(--font-dm-mono), ui-monospace, monospace",
                fontSize: "11px",
                color: "var(--fg-faint)",
              }}
            >
              loading local state...
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
          }}
        >
          {groups.map((g) => (
            <div
              key={g.key}
              style={{
                background: "var(--bg1)",
                border: "0.5px solid var(--border-3)",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minHeight: "200px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "8px",
                  borderBottom: "0.5px solid var(--border-3)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily:
                      "var(--font-dm-mono), ui-monospace, monospace",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: STATUS_META[g.key].color,
                  }}
                >
                  <span>{STATUS_META[g.key].icon}</span>
                  {g.label.toLowerCase()}
                </span>
                <span
                  className="pl-chip"
                  style={{ color: "var(--fg-mute)" }}
                >
                  {g.count}
                </span>
              </div>

              {g.rows.length === 0 ? (
                <p
                  style={{
                    margin: "auto 0",
                    textAlign: "center",
                    fontFamily:
                      "var(--font-dm-mono), ui-monospace, monospace",
                    fontSize: "11px",
                    color: "var(--fg-faint)",
                  }}
                >
                  {"// empty"}
                </p>
              ) : (
                g.rows.map((row) => (
                  <TrackerRowCard
                    key={row.slug}
                    row={row}
                    onCycle={() => cycleStatus(row.slug)}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrackerRowCard({
  row,
  onCycle,
}: {
  row: TrackerRow;
  onCycle: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "0.5px solid var(--border-3)",
        borderRadius: "6px",
        padding: "10px 11px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span
          className={`pl-difficulty-${row.difficulty.toLowerCase()}`}
          style={{
            fontFamily:
              "var(--font-dm-mono), ui-monospace, monospace",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {row.difficulty}
        </span>
        <button
          type="button"
          onClick={onCycle}
          title="cycle status"
          aria-label={`cycle status for ${row.title}`}
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            border: `1px solid ${STATUS_META[row.progress].color}`,
            background: "transparent",
            color: STATUS_META[row.progress].color,
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          {STATUS_META[row.progress].icon}
        </button>
      </div>
      <Link
        href={`/problems/${row.slug}`}
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--fg)",
          lineHeight: 1.3,
        }}
      >
        {row.title}
      </Link>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        <span className="pl-tag" style={{ background: "transparent" }}>
          {row.category}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily:
            "var(--font-dm-mono), ui-monospace, monospace",
          fontSize: "10px",
          color: "var(--fg-faint)",
          paddingTop: "4px",
          borderTop: "0.5px solid var(--border-3)",
        }}
      >
        <span>{row.timeComplexity}</span>
        <span>
          {row.dateSolved ? formatSolvedDate(row.dateSolved) : "—"}
        </span>
      </div>
    </div>
  );
}
