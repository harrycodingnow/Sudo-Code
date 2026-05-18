"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ProblemSummary } from "@/types/problem";

type Props = { problems: ProblemSummary[] };

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
type Diff = (typeof DIFFICULTIES)[number];

export function LabProblemList({ problems }: Props) {
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(problems.map((p) => p.category)))],
    [problems],
  );

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [diff, setDiff] = useState<Diff | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (diff !== "all" && p.difficulty !== diff) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keyConcepts.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [problems, query, cat, diff]);

  const byDiff = useMemo(() => {
    const out: Record<Diff, number> = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => {
      out[p.difficulty as Diff] = (out[p.difficulty as Diff] ?? 0) + 1;
    });
    return out;
  }, [problems]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* metric strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        <Metric label="total" value={problems.length} />
        <Metric label="easy" value={byDiff.Easy} accent="var(--accent)" />
        <Metric label="medium" value={byDiff.Medium} accent="var(--amber)" />
        <Metric label="hard" value={byDiff.Hard} accent="var(--red)" />
      </div>

      {/* filter bar */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          padding: "10px 12px",
          background: "var(--bg1)",
          border: "0.5px solid var(--border-3)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: "1 1 220px",
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: "var(--accent)",
              fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
              fontSize: "12px",
            }}
          >
            $
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep title, concept, category..."
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              outline: 0,
              color: "var(--fg)",
              fontFamily:
                "var(--font-dm-mono), ui-monospace, monospace",
              fontSize: "12px",
            }}
          />
        </div>

        <FilterGroup
          label="topic"
          options={categories}
          value={cat}
          onChange={setCat}
        />
        <FilterGroup
          label="diff"
          options={["all", ...DIFFICULTIES]}
          value={diff}
          onChange={(v) => setDiff(v as Diff | "all")}
        />
      </div>

      {/* result row count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
          fontSize: "11px",
          color: "var(--fg-mute)",
        }}
      >
        <span style={{ color: "var(--accent)" }}>→</span>
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
        {(cat !== "all" || diff !== "all" || query) && (
          <button
            type="button"
            className="pl-btn"
            style={{ padding: "3px 8px", fontSize: "10px" }}
            onClick={() => {
              setQuery("");
              setCat("all");
              setDiff("all");
            }}
          >
            reset
          </button>
        )}
      </div>

      {/* list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "10px",
        }}
      >
        {filtered.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--fg-mute)",
              border: "0.5px dashed var(--border-2)",
              borderRadius: "8px",
              gridColumn: "1 / -1",
              fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
              fontSize: "12px",
            }}
          >
            {"// no matches. relax a filter ↑"}
          </div>
        )}
        {filtered.map((p, i) => (
          <Link
            key={p.id}
            href={`/problems/${p.slug}`}
            className="pl-card pl-card-hover"
            style={{ textDecoration: "none", position: "relative" }}
          >
            <span
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                fontFamily:
                  "var(--font-dm-mono), ui-monospace, monospace",
                fontSize: "10px",
                color: "var(--fg-faint)",
              }}
            >
              {String(i + 1).padStart(3, "0")}
            </span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className="pl-tag">{p.category}</span>
              <span
                className={`pl-difficulty-${p.difficulty.toLowerCase()}`}
                style={{
                  fontFamily:
                    "var(--font-dm-mono), ui-monospace, monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {p.difficulty}
              </span>
            </div>
            <h3
              style={{
                margin: "2px 0 0",
                fontSize: "14.5px",
                fontWeight: 600,
                color: "var(--fg)",
                paddingRight: "32px",
              }}
            >
              {p.title}
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "auto",
              }}
            >
              {p.keyConcepts.slice(0, 3).map((k) => (
                <span key={k} className="pl-chip">
                  {k}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[] | T[];
  value: string;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span className="pl-label">{label}</span>
      <div
        style={{
          display: "flex",
          gap: "2px",
          background: "var(--bg2)",
          padding: "2px",
          borderRadius: "5px",
          border: "0.5px solid var(--border-3)",
        }}
      >
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o as T)}
            style={{
              padding: "3px 9px",
              borderRadius: "3px",
              border: 0,
              background: value === o ? "var(--bg3)" : "transparent",
              color: value === o ? "var(--fg)" : "var(--fg-mute)",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "lowercase",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="pl-card" style={{ padding: "12px 14px", gap: "4px" }}>
      <p className="pl-label">{label}</p>
      <p
        style={{
          margin: 0,
          fontFamily:
            "var(--font-dm-mono), ui-monospace, monospace",
          fontSize: "22px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: accent ?? "var(--fg)",
        }}
      >
        {value}
      </p>
    </div>
  );
}
