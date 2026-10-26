"use client";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main className="paper-bg grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-hand text-3xl text-brand">Something went wrong.</p>
        <button
          type="button"
          className="mt-4 border-2 border-ink bg-paper px-5 py-2 font-black uppercase"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
