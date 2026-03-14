import { notFound } from "next/navigation";

import { ProblemWorkspace } from "@/components/problem-workspace";
import { problems } from "@/data/problems";
import { getProblemBySlug } from "@/lib/problems";

type ProblemPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return problems.map((problem) => ({
    slug: problem.slug,
  }));
}

export async function generateMetadata({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    return {
      title: "Problem not found | SudoCode",
    };
  }

  return {
    title: `${problem.title} | SudoCode`,
    description: `Practice ${problem.title} in pseudocode and get AI interview feedback.`,
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4 xl:h-screen xl:overflow-hidden xl:px-6 xl:py-4">
      <ProblemWorkspace problem={problem} />
    </main>
  );
}
