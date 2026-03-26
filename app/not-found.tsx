import Link from "next/link";

import { PageFrame } from "@/components/page-frame";
import { SpotlightCard } from "@/components/spotlight-card";

export default function NotFound() {
  return (
    <PageFrame mainClassName="flex min-h-[calc(100vh-8rem)] items-center">
      <SpotlightCard className="linear-shell w-full rounded-[2rem] px-6 py-10 sm:px-8 sm:py-12">
        <div className="relative z-10 max-w-2xl space-y-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Problem not found
          </p>
          <h1 className="linear-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            That prompt is not part of this workspace.
          </h1>
          <p className="text-base leading-8 text-muted">
            Head back to the catalog and choose one of the seeded interview
            problems instead.
          </p>
          <Link
            href="/problems"
            className="linear-accent-button inline-flex rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Open problem catalog
          </Link>
        </div>
      </SpotlightCard>
    </PageFrame>
  );
}
