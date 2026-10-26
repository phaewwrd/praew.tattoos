"use client";

import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Card,
  ErrorMessage,
  STATUS_LABELS,
  StatusBadge,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { TableScroll } from "@/components/ui/TableScroll";
import { Textarea } from "@/components/ui/Textarea";
import { bookingStatusValues } from "@/db/app-schema";
import { formatDate, formatInstant } from "@/lib/time";
import { useServerAction } from "@/lib/use-server-action";
import type { AdminBookingRow } from "@/server/bookings";
import { updateBookingAction } from "./actions";
import { BookingsCalendar } from "./bookings-calendar";
import { NewBookingForm } from "./new-booking-form";

type ServiceOption = { id: string; name: string };

type Props = {
  bookings: AdminBookingRow[];
  services: ServiceOption[];
  today: string;
  initialQuery: string;
  initialStatus: string;
};

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});
const helper = createColumnHelper<typeof features, AdminBookingRow>();

export function BookingsManager({
  bookings,
  services,
  today,
  initialQuery,
  initialStatus,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [view, setView] = useState<"table" | "calendar">("table");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const digits = q.replace(/[^\d]/g, "");
    return bookings.filter(
      (b) =>
        (status === "all" || b.status === status) &&
        (!from || b.date >= from) &&
        (!to || b.date <= to) &&
        (!q ||
          b.customerName.toLowerCase().includes(q) ||
          b.email?.includes(q) ||
          (digits.length >= 3 &&
            b.phone?.replace(/[^\d]/g, "").includes(digits))),
    );
  }, [bookings, query, status, from, to]);

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor((row) => `${row.date} ${row.time}`, {
          id: "when",
          header: "Appointment",
          sortFn: "alphanumeric",
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              {formatDate(row.original.date)} · {row.original.time}
            </span>
          ),
        }),
        helper.accessor("customerName", {
          header: "Customer",
          sortFn: "alphanumeric",
          cell: ({ row }) => (
            <Link
              className="underline"
              href={`/admin/customers/${row.original.customerId}`}
            >
              {row.original.customerName}
            </Link>
          ),
        }),
        helper.display({
          id: "contact",
          header: "Contact",
          cell: ({ row }) => (
            <div className="text-xs">
              <div>{row.original.phone}</div>
              <div className="text-neutral-500">{row.original.email}</div>
            </div>
          ),
        }),
        helper.accessor("serviceName", {
          header: "Service",
          cell: ({ getValue }) => getValue() ?? "—",
        }),
        helper.accessor("status", {
          header: "Status",
          sortFn: "alphanumeric",
          cell: ({ getValue }) => <StatusBadge status={getValue()} />,
        }),
        helper.accessor("createdAt", {
          header: "Requested",
          sortFn: "alphanumeric",
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-xs">
              {formatInstant(new Date(row.original.createdAt))}
              {row.original.source === "admin" ? " (admin)" : ""}
            </span>
          ),
        }),
        helper.display({
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <Button
              variant="link"
              className="text-sm"
              onClick={() =>
                setEditingId(
                  editingId === row.original.id ? null : row.original.id,
                )
              }
            >
              {editingId === row.original.id ? "Close" : "Edit"}
            </Button>
          ),
        }),
      ]),
    [editingId],
  );

  const table = useTable({
    features,
    columns,
    data: filtered,
    getRowId: (row) => row.id,
    initialState: { sorting: [{ id: "when", desc: true }] },
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label
            htmlFor="booking-search"
            className="mb-1 block text-neutral-600 text-xs"
          >
            Search name, email or phone
          </label>
          <Input
            id="booking-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="booking-status"
            className="mb-1 block text-neutral-600 text-xs"
          >
            Status
          </label>
          <Select
            id="booking-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            {bookingStatusValues.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            htmlFor="booking-from"
            className="mb-1 block text-neutral-600 text-xs"
          >
            From
          </label>
          <Input
            id="booking-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="booking-to"
            className="mb-1 block text-neutral-600 text-xs"
          >
            To
          </label>
          <Input
            id="booking-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "table" ? "primary" : "secondary"}
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            Table
          </Button>
          <Button
            variant={view === "calendar" ? "primary" : "secondary"}
            aria-pressed={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            Calendar
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowNew(!showNew)}
            aria-expanded={showNew}
          >
            {showNew ? "Close form" : "New booking"}
          </Button>
        </div>
      </div>

      {showNew ? (
        <Card title="New booking">
          <NewBookingForm
            services={services}
            today={today}
            onDone={() => setShowNew(false)}
          />
        </Card>
      ) : null}

      {view === "calendar" ? (
        <BookingsCalendar bookings={filtered} today={today} />
      ) : (
        <Card className="p-0 sm:p-0">
          <TableScroll label="Bookings">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="border-neutral-200 border-b bg-neutral-50">
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {group.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      const canSort = header.column.getCanSort?.() ?? false;
                      return (
                        <th
                          key={header.id}
                          className="px-3 py-2 font-medium text-neutral-600"
                          aria-sort={
                            sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : undefined
                          }
                        >
                          {header.isPlaceholder ? null : canSort &&
                            header.column.columnDef.sortFn ? (
                            <button
                              type="button"
                              className="flex items-center gap-1 hover:underline"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <table.FlexRender header={header} />
                              <span aria-hidden="true">
                                {sorted === "asc"
                                  ? "↑"
                                  : sorted === "desc"
                                    ? "↓"
                                    : ""}
                              </span>
                            </button>
                          ) : (
                            <table.FlexRender header={header} />
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <BookingRow
                    key={row.id}
                    cells={row.getAllCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-top">
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                    editing={editingId === row.original.id}
                    booking={row.original}
                    services={services}
                    onClose={() => setEditingId(null)}
                    colSpan={columns.length}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? (
              <p className="p-4 text-neutral-600 text-sm">
                No bookings match these filters.
              </p>
            ) : null}
          </TableScroll>
        </Card>
      )}
    </div>
  );
}

function BookingRow({
  cells,
  editing,
  booking,
  services,
  onClose,
  colSpan,
}: {
  cells: React.ReactNode;
  editing: boolean;
  booking: AdminBookingRow;
  services: ServiceOption[];
  onClose: () => void;
  colSpan: number;
}) {
  return (
    <>
      <tr className="border-neutral-100 border-b">{cells}</tr>
      {editing ? (
        <tr className="border-neutral-200 border-b bg-neutral-50">
          <td colSpan={colSpan} className="px-3 py-3">
            <EditBooking
              booking={booking}
              services={services}
              onDone={onClose}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function EditBooking({
  booking,
  services,
  onDone,
}: {
  booking: AdminBookingRow;
  services: ServiceOption[];
  onDone: () => void;
}) {
  const [status, setStatus] = useState(booking.status);
  const [serviceId, setServiceId] = useState(booking.serviceId ?? "");
  const [note, setNote] = useState(booking.adminNote ?? "");
  const update = useServerAction(updateBookingAction, { onSuccess: onDone });
  const id = booking.id;

  return (
    <form
      className="grid gap-3 sm:grid-cols-[12rem_14rem_1fr_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        update.mutate({
          id,
          status,
          serviceId: serviceId || null,
          adminNote: note,
        });
      }}
    >
      <div>
        <label
          htmlFor={`${id}-status`}
          className="mb-1 block text-neutral-600 text-xs"
        >
          Status
        </label>
        <Select
          id={`${id}-status`}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as AdminBookingRow["status"])
          }
        >
          {bookingStatusValues.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label
          htmlFor={`${id}-service`}
          className="mb-1 block text-neutral-600 text-xs"
        >
          Service
        </label>
        <Select
          id={`${id}-service`}
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">None</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label
          htmlFor={`${id}-note`}
          className="mb-1 block text-neutral-600 text-xs"
        >
          Internal note
        </label>
        <Textarea
          id={`${id}-note`}
          rows={1}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={update.isPending}>
        Save
      </Button>
      <div className="sm:col-span-4">
        <ErrorMessage error={update.error} />
      </div>
    </form>
  );
}
