import { PageFrame } from "@/components/page-frame";
import { ProblemCatalog } from "@/components/problem-catalog";
import { getProblemSummaries } from "@/lib/problems";

export default function ProblemsPage() {
  const problemSummaries = getProblemSummaries();

  return (
    <PageFrame mainClassName="space-y-8">
      <ProblemCatalog problems={problemSummaries} />
    </PageFrame>
  );
}
