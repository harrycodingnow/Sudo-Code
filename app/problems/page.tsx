import { LabShell } from "@/components/lab/lab-shell";
import { LabProblemList } from "@/components/lab/lab-problem-list";
import { getProblemSummaries } from "@/lib/problems";

export default function ProblemsPage() {
  const problems = getProblemSummaries();

  return (
    <LabShell active="problems">
      <main className="pl-page">
        <div className="pl-page-head">
          <span className="pl-page-eyebrow">{"// ls ./problems"}</span>
          <h1 className="pl-page-title">Problem catalog</h1>
          <p className="pl-page-sub">
            Filter, scan, and pick the next prompt to work through. Each entry
            opens into the pseudocode workspace with step-through visualization.
          </p>
        </div>
        <LabProblemList problems={problems} />
      </main>
    </LabShell>
  );
}
