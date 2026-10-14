import { cn } from "@/lib/utils";

type Status = "PENDING" | "PENDING_PAYMENT" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "PAID" | "REFUNDED";

const badgeByStatus: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-blue-100 text-blue-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-red-100 text-red-900",
  NO_SHOW: "bg-neutral-200 text-neutral-700",
  PAID: "bg-emerald-100 text-emerald-900",
  REFUNDED: "bg-purple-100 text-purple-900",
};

export function StatusBadge({ status }: { status: Status | string }) {
  const key = status.toUpperCase() as Status;
  const tone = badgeByStatus[key] ?? "bg-neutral-200 text-neutral-700";

  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", tone)}>{status}</span>
  );
}
