import Link from "next/link";

import { LabShell } from "@/components/lab/lab-shell";
import { getProblemSummaries } from "@/lib/problems";

export default function Home() {
  const problemSummaries = getProblemSummaries();
  const categories = Array.from(new Set(problemSummaries.map((p) => p.category)));
  const featured = problemSummaries.slice(0, 4);
  const topics = Array.from(
    new Set(problemSummaries.flatMap((p) => p.keyConcepts)),
  ).slice(0, 8);

  return (
    <LabShell
      active="home"
      stats={
        <>
          <span className="pl-nav-stat">
            <span className="pl-nav-stat-dot" />
            {problemSummaries.length} problems
          </span>
          <span style={{ color: "var(--fg-faint)" }}>·</span>
          <span>{categories.length} topics</span>
        </>
      }
    >
      <main className="pl-page">
        {/* hero */}
        <section
          style={{
            background: "var(--bg1)",
            border: "0.5px solid var(--border-3)",
            borderRadius: "10px",
            padding: "32px 28px",
            marginBottom: "24px",
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "minmax(0,1.4fr) minmax(280px,1fr)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
<span className="pl-page-eyebrow">{"// logic-first interview prep"}</span>
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                margin: 0,
                color: "var(--fg)",
              }}
            >
              Build the{" "}
              <span style={{ color: "var(--accent)" }}>algorithm</span>
              <br />
              before the syntax.
            </h1>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "var(--fg-mute)",
                margin: 0,
                maxWidth: "520px",
              }}
            >
              SudoCode is a pseudocode-first workbench. Write the logic in plain
              indented English, watch it execute step-by-step, and learn the
              concept — not just the language.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <Link href="/problems" className="pl-btn-primary">
                Browse problems →
              </Link>
              <Link href="/tracker" className="pl-btn">
                Open tracker
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "8px",
              }}
            >
              {topics.map((t) => (
                <span key={t} className="pl-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* mini-editor preview */}
          <div
            style={{
              background: "var(--bg0)",
              border: "0.5px solid var(--border-3)",
              borderRadius: "8px",
              padding: "14px 16px",
              fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
              fontSize: "12px",
              lineHeight: 1.7,
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                paddingBottom: "8px",
                borderBottom: "0.5px solid var(--border-3)",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--red)",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--amber)",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--fg-faint)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                binary_search.pc
              </span>
            </div>
            <code style={{ display: "block", whiteSpace: "pre" }}>
              <Line n={1}>
                <K>set</K> left <O>=</O> <N>0</N>
              </Line>
              <Line n={2}>
                <K>set</K> right <O>=</O> length(arr) <O>-</O> <N>1</N>
              </Line>
              <Line n={3}>
                <K>while</K> left <O>{"<="}</O> right
              </Line>
              <Line n={4} indent={1} active>
                <K>set</K> mid <O>=</O> (left <O>+</O> right) <O>/</O> <N>2</N>
              </Line>
              <Line n={5} indent={1}>
                <K>if</K> arr[mid] <O>==</O> target
              </Line>
              <Line n={6} indent={2}>
                <K>return</K> mid
              </Line>
            </code>
          </div>
        </section>

        {/* value strip */}
        <section
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            marginBottom: "32px",
          }}
        >
          <Metric label="problem.bank" value={String(problemSummaries.length)} detail="curated interview prompts seeded in the workspace" />
          <Metric label="topic.coverage" value={String(categories.length)} detail="DSA buckets — arrays, trees, graphs, DP and more" />
          <Metric label="coach.mode" value="live" detail="guided chat + step-through validator on every attempt" accent />
        </section>

        {/* featured */}
        <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <p className="pl-page-eyebrow">{"// featured"}</p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  margin: "6px 0 0",
                }}
              >
                Start with something popular
              </h2>
            </div>
            <Link
              href="/problems"
              className="pl-btn"
              style={{ borderColor: "transparent" }}
            >
              see all →
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            }}
          >
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className="pl-card pl-card-hover"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
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
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--fg)",
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
        </section>
      </main>
    </LabShell>
  );
}

/* ---------- tiny helpers (server-renderable) ---------- */

function Metric({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="pl-card">
      <p className="pl-label">{label}</p>
      <p
        style={{
          margin: 0,
          fontSize: "30px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: accent ? "var(--accent)" : "var(--fg)",
          fontFamily:
            "var(--font-dm-mono), ui-monospace, monospace",
        }}
      >
        {value}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: 1.5,
          color: "var(--fg-mute)",
        }}
      >
        {detail}
      </p>
    </div>
  );
}

function K({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--purple)" }}>{children}</span>;
}
function O({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--accent)" }}>{children}</span>;
}
function N({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--warm)" }}>{children}</span>;
}
function Line({
  n,
  indent = 0,
  active = false,
  children,
}: {
  n: number;
  indent?: number;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "0 6px",
        borderLeft: active
          ? "2px solid var(--accent)"
          : "2px solid transparent",
        background: active ? "var(--accent-soft)" : "transparent",
      }}
    >
      <span
        style={{
          color: "var(--fg-faint)",
          width: "20px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <span style={{ paddingLeft: `${indent * 16}px` }}>{children}</span>
    </div>
  );
}
