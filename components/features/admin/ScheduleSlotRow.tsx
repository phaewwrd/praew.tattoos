import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { isBooked } from "@/hooks/useScheduleManager";
import type { AdminScheduleSlot } from "@/services/admin-schedule";
import { formatTimeOfDay } from "@/utils/date";

type ScheduleSlotRowProps = {
  slot: AdminScheduleSlot;
  artistName: string;
  dateBlocked: boolean;
  busy: boolean;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleAvailable: () => void;
  onRemove: () => void;
};

const timeInputClass =
  "rounded-md border border-neutral-300 px-2 py-2 text-sm text-neutral-900";
const smallButtonClass = "px-2.5 py-1.5 text-xs";

export function ScheduleSlotRow({
  slot,
  artistName,
  dateBlocked,
  busy,
  editing,
  onEdit,
  onCancelEdit,
  onSubmit,
  onToggleAvailable,
  onRemove,
}: ScheduleSlotRowProps) {
  const bookedSlot = isBooked(slot);
  const status = bookedSlot
    ? "Booked"
    : dateBlocked || slot.status === "BLOCKED"
      ? "Blocked"
      : "Available";

  if (editing) {
    return (
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 font-medium text-neutral-600 text-xs">
          Start
          <input
            name="startTime"
            type="time"
            required
            defaultValue={slot.startTime}
            className={timeInputClass}
          />
        </label>
        <label className="grid gap-1 font-medium text-neutral-600 text-xs">
          End
          <input
            name="endTime"
            type="time"
            required
            defaultValue={slot.endTime}
            className={timeInputClass}
          />
        </label>
        <Button type="submit" disabled={busy} className="px-3">
          Save
        </Button>
        <button
          type="button"
          onClick={onCancelEdit}
          className="px-2 py-2 text-neutral-600 text-sm"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-neutral-500 text-xs">Artist: {artistName}</p>
        <p className="font-medium text-neutral-900">
          {formatTimeOfDay(slot.startTime)}–{formatTimeOfDay(slot.endTime)}
        </p>
        <p
          className={`mt-1 font-medium text-xs ${bookedSlot ? "text-sky-800" : status === "Blocked" ? "text-amber-800" : "text-emerald-800"}`}
        >
          {status}
          {slot.appointmentStatus
            ? ` · ${slot.appointmentStatus.replace("_", " ")}`
            : ""}
          {slot.clientName ? ` · ${slot.clientName}` : ""}
        </p>
      </div>
      {!bookedSlot && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={busy || dateBlocked}
            onClick={onEdit}
            className={smallButtonClass}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            disabled={busy || dateBlocked}
            onClick={onToggleAvailable}
            className={smallButtonClass}
          >
            {slot.status === "AVAILABLE" ? "Block slot" : "Make available"}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={onRemove}
            className={smallButtonClass}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
