"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-900">Unable to load admin page</h1>
      <p className="mt-2 text-sm text-red-800">
        A temporary error occurred while loading this admin route. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-red-900 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Try again
      </button>
    </section>
  );
}
