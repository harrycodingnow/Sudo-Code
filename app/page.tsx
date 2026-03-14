import { ProblemCatalog } from "@/components/problem-catalog";
import { getProblemSummaries } from "@/lib/problems";

export default function Home() {
  const problemSummaries = getProblemSummaries();

  return <ProblemCatalog problems={problemSummaries} />;
}
