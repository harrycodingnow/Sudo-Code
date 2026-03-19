import { ProblemTracker } from "@/components/problem-tracker";
import { SiteHeader } from "@/components/site-header";
import { getProblemSummaries } from "@/lib/problems";

export default function TrackerPage() {
  const problemSummaries = getProblemSummaries();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <ProblemTracker problems={problemSummaries} />
    </div>
  );
}
