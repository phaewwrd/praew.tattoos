import "server-only";

import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { slots } from "@/db/schema";
import { addDays, isPastSlot, toBangkokDate } from "@/lib/time";

export const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

// Correlated subqueries spell out table names: Drizzle omits them in single-table queries.
const noActiveBooking = sql`not exists (
  select 1 from bookings b
  where b.slot_id = "slots"."id" and b.status in ('pending', 'confirmed')
)`;

const noBookingAtAll = sql`not exists (select 1 from bookings b where b.slot_id = "slots"."id")`;

export type AdminSlot = {
  id: string;
  date: string;
  startTime: string;
  isOpen: boolean;
  booking: { id: string; status: string; customerName: string } | null;
  hasAnyBooking: boolean;
};

export async function listSlotsInRange(
  from: string,
  to: string,
): Promise<AdminSlot[]> {
  const rows = await db.query.slots.findMany({
    where: and(gte(slots.date, from), lte(slots.date, to)),
    orderBy: [asc(slots.date), asc(slots.startTime)],
    with: {
      bookings: {
        columns: { id: true, status: true },
        with: { customer: { columns: { firstName: true, lastName: true } } },
      },
    },
  });
  return rows.map((slot) => {
    const active = slot.bookings.find((b) =>
      (ACTIVE_STATUSES as readonly string[]).includes(b.status),
    );
    return {
      id: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      isOpen: slot.isOpen,
      hasAnyBooking: slot.bookings.length > 0,
      booking: active
        ? {
            id: active.id,
            status: active.status,
            customerName: `${active.customer.firstName} ${active.customer.lastName}`,
          }
        : null,
    };
  });
}

export type PublicSlot = {
  id: string;
  date: string;
  time: string;
  free: boolean;
};

/** Open slots from today onwards (Bangkok); booked ones are returned as not free. */
export async function listPublicSlots(days = 120): Promise<PublicSlot[]> {
  const today = toBangkokDate();
  const rows = await db
    .select({
      id: slots.id,
      date: slots.date,
      time: slots.startTime,
      booked: sql<boolean>`not (${noActiveBooking})`,
    })
    .from(slots)
    .where(
      and(
        eq(slots.isOpen, true),
        gte(slots.date, today),
        lte(slots.date, addDays(today, days)),
      ),
    )
    .orderBy(asc(slots.date), asc(slots.startTime));

  const now = new Date();
  return rows
    .filter((row) => !isPastSlot(row.date, row.time, now))
    .map((row) => ({
      id: row.id,
      date: row.date,
      time: row.time.slice(0, 5),
      free: !row.booked,
    }));
}

/**
 * Opens the given times on each date. In "replace" mode, slots on those dates
 * that are not in `times` are deleted when they never had a booking, closed when
 * they only had past (cancelled/completed) bookings, and kept when active.
 */
export async function setDaySlots(
  dates: string[],
  times: string[],
  mode: "replace" | "add",
) {
  await db.transaction(async (tx) => {
    if (times.length > 0) {
      await tx
        .insert(slots)
        .values(
          dates.flatMap((date) =>
            times.map((startTime) => ({ date, startTime })),
          ),
        )
        .onConflictDoUpdate({
          target: [slots.date, slots.startTime],
          set: { isOpen: true },
        });
    }
    if (mode === "add") return;

    const stale = await tx.query.slots.findMany({
      where: inArray(slots.date, dates),
      columns: { id: true, startTime: true },
      with: { bookings: { columns: { status: true } } },
    });
    const removable = stale.filter((slot) => !times.includes(slot.startTime));
    const deletable = removable
      .filter((s) => s.bookings.length === 0)
      .map((s) => s.id);
    const closable = removable
      .filter(
        (s) =>
          s.bookings.length > 0 &&
          !s.bookings.some((b) =>
            (ACTIVE_STATUSES as readonly string[]).includes(b.status),
          ),
      )
      .map((s) => s.id);
    if (deletable.length)
      await tx.delete(slots).where(inArray(slots.id, deletable));
    if (closable.length) {
      await tx
        .update(slots)
        .set({ isOpen: false })
        .where(inArray(slots.id, closable));
    }
  });
}

/** Copies the open slots of the week before `weekStart` into the week starting at `weekStart`. */
export async function copyPreviousWeek(weekStart: string): Promise<number> {
  const source = await db
    .select({ date: slots.date, startTime: slots.startTime })
    .from(slots)
    .where(
      and(
        eq(slots.isOpen, true),
        gte(slots.date, addDays(weekStart, -7)),
        lte(slots.date, addDays(weekStart, -1)),
      ),
    );
  if (source.length === 0) return 0;
  const inserted = await db
    .insert(slots)
    .values(
      source.map((s) => ({ date: addDays(s.date, 7), startTime: s.startTime })),
    )
    .onConflictDoNothing()
    .returning({ id: slots.id });
  return inserted.length;
}

/** Deletes slots without any booking; closes slots that only have inactive bookings. */
export async function removeSlots(ids: string[]) {
  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(slots)
      .where(and(inArray(slots.id, ids), noBookingAtAll))
      .returning({ id: slots.id });
    const closed = await tx
      .update(slots)
      .set({ isOpen: false })
      .where(and(inArray(slots.id, ids), noActiveBooking))
      .returning({ id: slots.id });
    return {
      deleted: deleted.length,
      closed: closed.length,
      kept: ids.length - deleted.length - closed.length,
    };
  });
}
