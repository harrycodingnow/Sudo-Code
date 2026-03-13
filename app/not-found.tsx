import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-5 px-5 py-10 sm:px-8">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
        Problem not found
      </p>
      <h1 className="font-display text-5xl leading-none text-foreground">
        That prompt isn&apos;t in the MVP set.
      </h1>
      <p className="max-w-xl text-base leading-8 text-muted">
        Head back to the home page and pick one of the seeded practice
        questions.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
      >
        Return home
      </Link>
    </main>
  );
}
