import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-10 sm:px-8">
      <div className="app-panel w-full rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
          Problem not found
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-foreground">
          That prompt isn&apos;t in the MVP set.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-muted">
          Head back to the home page and pick one of the seeded practice
          questions.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accentForeground transition hover:bg-white/90"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
