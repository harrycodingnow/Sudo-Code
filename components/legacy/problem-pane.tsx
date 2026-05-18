import type { ReactNode } from "react";

import { SpotlightCard } from "@/components/legacy/spotlight-card";
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

function SectionHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-semibold tracking-tight text-foreground ${className}`}>
      {children}
    </h2>
  );
}

function ExampleCard({
  input,
  output,
  explanation,
}: {
  input: string;
  output: string;
  explanation?: string;
}) {
  return (
    <SpotlightCard className="linear-card rounded-[1.45rem] px-4 py-4">
      <div className="relative z-10 space-y-3 text-sm leading-6 text-foreground">
        <p>
          <span className="font-semibold text-foreground">Input:</span>{" "}
          <InlineCodeText text={input} />
        </p>
        <p>
          <span className="font-semibold text-foreground">Output:</span>{" "}
          <InlineCodeText text={output} />
        </p>
        {explanation ? (
          <p className="text-muted">
            <span className="font-semibold text-foreground">Explanation:</span>{" "}
            <InlineCodeText text={explanation} />
          </p>
        ) : null}
      </div>
    </SpotlightCard>
  );
}

export function ProblemPane({ problem }: ProblemPaneProps) {
  return (
    <SpotlightCard
      as="section"
      className="linear-shell flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] p-6 xl:p-7"
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Problem brief
              </p>
              <div className="space-y-2.5 text-[0.95rem] leading-[1.72] text-foreground">
                {problem.description.split("\n\n").map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>
                    <InlineCodeText text={paragraph} />
                  </p>
                ))}
              </div>
            </div>

          </div>

          {problem.examples.length > 0 ? (
            <section className="space-y-3">
              <SectionHeading>Examples</SectionHeading>
              <div className="space-y-3">
                {problem.examples.map((example) => (
                  <ExampleCard
                    key={`${example.input}-${example.output}`}
                    input={example.input}
                    output={example.output}
                    explanation={example.explanation}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {problem.constraints.length > 0 ? (
            <section className="space-y-3">
              <SectionHeading>Constraints</SectionHeading>
              <SpotlightCard className="linear-card rounded-[1.45rem] px-4 py-4">
                <ul className="relative z-10 space-y-1.5 pl-5 text-sm leading-6 text-foreground marker:text-muted">
                  {problem.constraints.map((constraint) => (
                    <li key={constraint}>
                      <InlineCodeText text={constraint} />
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </section>
          ) : null}
        </div>
      </div>
    </SpotlightCard>
  );
}
