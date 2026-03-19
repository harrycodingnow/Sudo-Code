import type { ReactNode } from "react";

import { DifficultyBadge } from "@/components/difficulty-badge";
import type { Problem } from "@/types/problem";

type ProblemPaneProps = {
  problem: Problem;
};

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
    <p className="font-mono text-base leading-8 text-foreground">
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
    <div className="font-mono text-base leading-8 text-muted">
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
    <section className="rounded-2xl border border-border bg-surface p-5 xl:flex xl:min-h-0 xl:flex-col xl:overflow-y-auto xl:p-6">
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted">
              {problem.category}
            </span>
          </div>

          <div className="space-y-6 text-[1.05rem] leading-9 text-foreground">
            {problem.description.split("\n\n").map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>
                <InlineCodeText text={paragraph} />
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {problem.examples.map((example, index) => (
            <section key={`${example.input}-${example.output}`} className="space-y-4">
              <SectionHeading className="text-xl">Example {index + 1}:</SectionHeading>
              <div className="border-l border-borderStrong pl-6">
                <ExampleBlock label="Input" value={example.input} />
                <ExampleBlock label="Output" value={example.output} />
                <ExplanationBlock value={example.explanation} />
              </div>
            </section>
          ))}
        </div>

        <section className="space-y-4">
          <SectionHeading className="text-xl">Constraints:</SectionHeading>
          <ul className="space-y-3 pl-6 text-base leading-8 text-foreground marker:text-muted">
            {problem.constraints.map((constraint) => (
              <li key={constraint}>
                <InlineCodeText text={constraint} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
