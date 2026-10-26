import type { ReactNode } from "react";
import type { BookingStatus } from "@/db/app-schema";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-semibold text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-neutral-600 text-sm">{description}</p>
        ) : null}
      </div>
      {actions}
    </header>
  );
}

export function Card({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 sm:p-5",
        className,
      )}
    >
      {title ? <h2 className="mb-4 font-semibold text-lg">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="font-medium text-neutral-800 text-sm">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-neutral-500 text-xs">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-red-700 text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;
  return (
    <p className="text-red-700 text-sm" role="alert">
      {error.message}
    </p>
  );
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  completed: "bg-sky-100 text-sky-900",
  cancelled: "bg-neutral-200 text-neutral-700",
  no_show: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 font-medium text-xs",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ReorderButtons({
  index,
  count,
  onMove,
  disabled,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
  label: string;
}) {
  const buttonClass =
    "grid size-9 place-items-center rounded-md border border-neutral-300 text-sm hover:bg-neutral-100 disabled:opacity-40";
  return (
    <div className="flex gap-1">
      <button
        type="button"
        className={buttonClass}
        aria-label={`Move ${label} up`}
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Move ${label} down`}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        ↓
      </button>
    </div>
  );
}

export function moveItem<T>(
  items: readonly T[],
  from: number,
  to: number,
): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
