"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import { appointments, slots } from "@/app/db/tattoo-schema";
import { requireAdminSession } from "@/lib/admin-auth";
import type { BookingStatus } from "@/lib/bookings";
import type { MutationResult } from "../services/actions";

const statuses: BookingStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export async function updateBooking(id: number, status: BookingStatus, notes: string): Promise<MutationResult> {
  await requireAdminSession();
  if (!Number.isSafeInteger(id) || id < 1 || !statuses.includes(status) || typeof notes !== "string" || notes.length > 10000) {
    return { ok: false, error: "Enter a valid booking status and notes." };
  }
  try {
    const updated = await db.transaction(async (tx) => {
      const [booking] = await tx.select({ id: appointments.id, slotId: appointments.slotId }).from(appointments).where(eq(appointments.id, id)).for("update");
      if (!booking) return false;
      await tx.update(appointments).set({ status, notes: notes.trim() || null }).where(eq(appointments.id, id));
      const [otherActiveBooking] = await tx.select({ id: appointments.id }).from(appointments).where(
        and(eq(appointments.slotId, booking.slotId), ne(appointments.id, id), ne(appointments.status, "CANCELLED")),
      ).limit(1);
      await tx.update(slots).set({ status: status === "CANCELLED" && !otherActiveBooking ? "AVAILABLE" : "BOOKED" }).where(eq(slots.id, booking.slotId));
      return true;
    });
    if (!updated) return { ok: false, error: "Booking not found." };
  } catch {
    return { ok: false, error: "Unable to update this booking. Try again." };
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/clients");
  return { ok: true };
}