import { LabShell } from "@/components/lab/lab-shell";
import { LabTracker } from "@/components/lab/lab-tracker";
import { getProblemSummaries } from "@/lib/problems";

export default function TrackerPage() {
  const problemSummaries = getProblemSummaries();

  return (
    <LabShell active="tracker">
      <main className="pl-page">
        <div className="pl-page-head">
          <span className="pl-page-eyebrow">{"// cat ./tracker.log"}</span>
          <h1 className="pl-page-title">Practice tracker</h1>
          <p className="pl-page-sub">
            Local-first board of every prompt. Click the status dot on a card to
            cycle: To&nbsp;Do → In&nbsp;Progress → Need&nbsp;Review → Completed.
          </p>
        </div>
        <LabTracker problems={problemSummaries} />
      </main>
    </LabShell>
  );
}
