export type Difficulty = "Easy" | "Medium" | "Hard";

export type ProblemExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  idealPseudocode: string;
  referencePython: string;
  keyConcepts: string[];
  starterPseudocode: string;
};

export type ProblemSummary = Pick<
  Problem,
  "id" | "slug" | "title" | "difficulty" | "category" | "keyConcepts"
>;
