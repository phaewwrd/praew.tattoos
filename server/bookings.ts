import "server-only";

import { and, asc, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db, type Tx } from "@/db";
import {
  type BookingStatus,
  bookings,
  customers,
  services,
  slots,
} from "@/db/schema";
import { ActionError } from "@/lib/server-response";
import { isPastSlot } from "@/lib/time";
import { findOrCreateCustomer } from "@/server/customers";
import { ACTIVE_STATUSES } from "@/server/slots";

function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

const SLOT_TAKEN = "Sorry, that time was just taken. Please pick another slot.";

type CreateBookingInput = {
  slotId: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
  status: BookingStatus;
  source: "website" | "admin";
  serviceId?: string | null;
  adminNote?: string | null;
};

/**
 * Creates a booking inside a transaction. The slot row is locked (FOR UPDATE) so
 * concurrent requests for the same slot are serialized; the partial unique index
 * on bookings(slot_id) for active statuses is the final guarantee.
 */
export async function createBooking(input: CreateBookingInput) {
  try {
    return await db.transaction(async (tx) => {
      const [slot] = await tx
        .select()
        .from(slots)
        .where(eq(slots.id, input.slotId))
        .for("update");

      if (!slot || (input.source === "website" && !slot.isOpen)) {
        throw new ActionError("SLOT_UNAVAILABLE", SLOT_TAKEN);
      }
      if (input.source === "website" && isPastSlot(slot.date, slot.startTime)) {
        throw new ActionError(
          "SLOT_UNAVAILABLE",
          "That time has already passed.",
        );
      }

      const isActive = (ACTIVE_STATUSES as readonly string[]).includes(
        input.status,
      );
      if (isActive && (await hasActiveBooking(tx, slot.id))) {
        throw new ActionError("SLOT_UNAVAILABLE", SLOT_TAKEN);
      }

      const customerId = await findOrCreateCustomer(tx, input.contact);
      const [booking] = await tx
        .insert(bookings)
        .values({
          customerId,
          slotId: slot.id,
          status: input.status,
          source: input.source,
          serviceId: input.serviceId ?? null,
          adminNote: input.adminNote ?? null,
        })
        .returning({ id: bookings.id });

      return {
        id: booking.id,
        date: slot.date,
        time: slot.startTime.slice(0, 5),
      };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ActionError("SLOT_UNAVAILABLE", SLOT_TAKEN);
    }
    throw error;
  }
}

async function hasActiveBooking(tx: Tx, slotId: string) {
  const [row] = await tx
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.slotId, slotId),
        inArray(bookings.status, [...ACTIVE_STATUSES]),
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** Admin: creates the slot on the fly if needed, then books it. */
export async function createAdminBooking(
  input: Omit<CreateBookingInput, "slotId" | "source"> & {
    date: string;
    time: string;
  },
) {
  const [slot] = await db
    .insert(slots)
    .values({ date: input.date, startTime: input.time })
    .onConflictDoUpdate({
      target: [slots.date, slots.startTime],
      set: { isOpen: true },
    })
    .returning({ id: slots.id });
  return createBooking({ ...input, slotId: slot.id, source: "admin" });
}

export async function updateBooking(input: {
  id: string;
  status: BookingStatus;
  serviceId: string | null;
  adminNote?: string | null;
}) {
  try {
    const [row] = await db
      .update(bookings)
      .set({
        status: input.status,
        serviceId: input.serviceId,
        adminNote: input.adminNote ?? null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, input.id))
      .returning({ id: bookings.id });
    if (!row) throw new ActionError("NOT_FOUND", "Booking not found.");
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ActionError(
        "SLOT_UNAVAILABLE",
        "Another active booking already holds this slot. Cancel it first.",
      );
    }
    throw error;
  }
}

export type AdminBookingRow = {
  id: string;
  status: BookingStatus;
  source: "website" | "admin";
  date: string;
  time: string;
  createdAt: string;
  adminNote: string | null;
  serviceId: string | null;
  serviceName: string | null;
  customerId: string;
  customerName: string;
  email: string | null;
  phone: string | null;
};

const bookingSelect = {
  id: bookings.id,
  status: bookings.status,
  source: bookings.source,
  date: slots.date,
  time: slots.startTime,
  createdAt: bookings.createdAt,
  adminNote: bookings.adminNote,
  serviceId: bookings.serviceId,
  serviceName: services.name,
  customerId: customers.id,
  firstName: customers.firstName,
  lastName: customers.lastName,
  email: customers.email,
  phone: customers.phone,
};

type BookingQueryRow = Awaited<ReturnType<typeof bookingQuery>>[number];

function toRow(r: BookingQueryRow): AdminBookingRow {
  return {
    id: r.id,
    status: r.status,
    source: r.source,
    date: r.date,
    time: r.time.slice(0, 5),
    createdAt: r.createdAt.toISOString(),
    adminNote: r.adminNote,
    serviceId: r.serviceId,
    serviceName: r.serviceName,
    customerId: r.customerId,
    customerName: `${r.firstName} ${r.lastName}`,
    email: r.email,
    phone: r.phone,
  };
}

function bookingQuery() {
  return db
    .select(bookingSelect)
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .innerJoin(customers, eq(customers.id, bookings.customerId))
    .leftJoin(services, eq(services.id, bookings.serviceId));
}

export async function listBookings(range?: { from?: string; to?: string }) {
  const rows = await bookingQuery()
    .where(
      and(
        range?.from ? gte(slots.date, range.from) : undefined,
        range?.to ? lte(slots.date, range.to) : undefined,
      ),
    )
    .orderBy(desc(slots.date), desc(slots.startTime))
    .limit(2000);
  return rows.map(toRow);
}

export async function listAppointmentsOn(dates: string[]) {
  const rows = await bookingQuery()
    .where(
      and(
        inArray(slots.date, dates),
        inArray(bookings.status, ["pending", "confirmed", "completed"]),
      ),
    )
    .orderBy(asc(slots.date), asc(slots.startTime));
  return rows.map(toRow);
}

export async function countPending() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(eq(bookings.status, "pending"));
  return row.count;
}
