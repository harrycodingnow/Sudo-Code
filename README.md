# SudoCode

SudoCode is a lightweight interview practice app for working through classic DSA problems in pseudocode. Instead of compiling code, it gives structured AI feedback on algorithmic reasoning like an interviewer would.

## What it includes

- Home page with a seeded list of 10 classic problems
- Problem detail pages with description, examples, constraints, and key concepts
- Large pseudocode editor with local draft persistence per problem
- AI review flow via `POST /api/review`
- Structured feedback covering correctness, missing steps, edge cases, complexity, and follow-up questions
- Revealable ideal pseudocode and Python reference solution
- Minimal desktop-first UI built with Next.js App Router and Tailwind CSS

## MVP boundaries

This project intentionally does **not** include:

- Authentication
- Database storage
- Code execution or sandboxing
- Submission history backend
- Leaderboards
- Multiple programming languages

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Local TypeScript seed data
- Zod for validation

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and add your OpenAI API key:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Environment variables

- `OPENAI_API_KEY`: required for AI feedback requests
- `OPENAI_MODEL`: optional, defaults to `gpt-5-mini`

## Scripts

- `npm run dev`: start local development
- `npm run build`: create a production build
- `npm run start`: run the production server
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks

## Project structure

```text
app/
  api/review/route.ts        OpenAI-backed review endpoint
  problems/[slug]/page.tsx   Problem page
components/
  feedback-panel.tsx         Structured review UI
  problem-card.tsx           Home page problem card
  problem-catalog.tsx        Difficulty filter + problem grid
  problem-workspace.tsx      Editor, review action, reveal solution
data/
  problems.ts                Seeded problem set
lib/
  problems.ts                Problem lookup helpers
  review-schema.ts           Shared request/response schemas
types/
  problem.ts                 Problem types
```

## Notes

- Problem content is hardcoded for MVP speed and simple deployment.
- The review route validates input server-side before calling OpenAI.
- Feedback is designed to sound like an interview coach rather than a compiler or judge.
