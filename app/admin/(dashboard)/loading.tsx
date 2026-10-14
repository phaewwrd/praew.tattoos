export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="h-8 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl bg-neutral-200" />
        <div className="h-28 animate-pulse rounded-xl bg-neutral-200" />
        <div className="h-28 animate-pulse rounded-xl bg-neutral-200" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-neutral-200" />
    </div>
  );
}
