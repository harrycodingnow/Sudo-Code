import type { ReactNode } from "react";

import { DifficultyBadge } from "@/components/difficulty-badge";
import type { Problem } from "@/types/problem";

type ProblemPaneProps = {
  problem: Problem;
};

const problemPaneSurfaceClass =
  "border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(88,142,118,0.18),transparent_42%),linear-gradient(180deg,rgba(44,50,64,0.96)_0%,rgba(29,34,46,0.98)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

const problemPaneInnerCardClass =
  "border border-white/8 bg-[linear-gradient(180deg,rgba(26,31,44,0.92)_0%,rgba(19,24,36,0.96)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

function InlineCodeText({ text }: { text: string }) {
  const parts = text.split("`");

  return (
    <>
      {parts.map((part, index) => {
        const isCode = index % 2 === 1;

        if (!part) {
          return null;
        }

        if (isCode) {
          return (
            <code
              key={`${part}-${index}`}
              className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[0.95em] text-foreground"
            >
              {part}
            </code>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function ExampleBlock({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <p className="font-mono text-sm leading-6 text-foreground">
      <span className="font-semibold text-foreground">{label}:</span>{" "}
      <InlineCodeText text={value} />
    </p>
  );
}

function ExplanationBlock({ value }: { value?: string }) {
  if (!value) {
    return null;
  }

  const lines = value.split("\n");

  return (
    <div className="font-mono text-sm leading-6 text-muted">
      <p>
        <span className="font-semibold text-foreground">Explanation:</span>{" "}
        <InlineCodeText text={lines[0]} />
      </p>
      {lines.slice(1).map((line, index) => (
        <p key={`${line}-${index}`} className="pl-0">
          <InlineCodeText text={line} />
        </p>
      ))}
    </div>
  );
}

function SectionHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-2xl font-semibold tracking-tight text-foreground ${className}`}>
      {children}
    </h2>
  );
}

export function ProblemPane({ problem }: ProblemPaneProps) {
  return (
    <section
      className={`${problemPaneSurfaceClass} rounded-[2rem] p-6 xl:flex xl:min-h-0 xl:flex-col xl:overflow-y-auto xl:p-7`}
    >
      <div className="space-y-7">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="rounded-full border border-white/10 bg-[rgba(66,108,88,0.55)] px-3.5 py-1.5 text-sm font-medium text-foreground">
              {problem.category}
            </span>
          </div>

          <div className="space-y-2.5 text-[0.93rem] leading-[1.65] text-foreground">
            {problem.description.split("\n\n").map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>
                <InlineCodeText text={paragraph} />
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {problem.examples.map((example) => (
            <section key={`${example.input}-${example.output}`}>
              <div className={`${problemPaneInnerCardClass} rounded-[1.45rem] px-4 py-3 space-y-0.5`}>
                <ExampleBlock label="Input" value={example.input} />
                <ExampleBlock label="Output" value={example.output} />
                <ExplanationBlock value={example.explanation} />
              </div>
            </section>
          ))}
        </div>

        <section className="space-y-3">
          <SectionHeading className="text-lg">Constraints:</SectionHeading>
          <div className={`${problemPaneInnerCardClass} rounded-[1.45rem] px-4 py-3`}>
            <ul className="space-y-1 pl-5 text-sm leading-6 text-foreground marker:text-muted">
              {problem.constraints.map((constraint) => (
                <li key={constraint}>
                  <InlineCodeText text={constraint} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}
