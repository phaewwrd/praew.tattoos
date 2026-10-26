"use client";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-4 py-16">
      <p className="text-sm uppercase">Something went wrong</p>
      <h1>We couldn&apos;t load this page.</h1>
      <button type="button" className="underline" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
