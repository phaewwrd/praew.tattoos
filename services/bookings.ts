import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  clients,
  payments,
  slots,
  tattooServices,
} from "@/db/tattoo-schema";

export type BookingStatus = typeof appointments.$inferSelect.status;
export type Booking = Awaited<ReturnType<typeof getBookings>>[number];

export async function getBookings() {
  const rows = await db
    .select({
      id: appointments.id,
      clientId: clients.id,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      slotId: slots.id,
      date: slots.date,
      startTime: slots.startTime,
      endTime: slots.endTime,
      status: appointments.status,
      details: appointments.details,
      notes: appointments.notes,
      agreedPrice: appointments.agreedPrice,
      depositAmount: appointments.depositAmount,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .innerJoin(clients, eq(clients.id, appointments.clientId))
    .innerJoin(slots, eq(slots.id, appointments.slotId))
    .orderBy(desc(slots.date), desc(slots.startTime));

  const ids = rows.map((row) => row.id);
  const paymentRows = ids.length
    ? await db
        .select({
          appointmentId: payments.appointmentId,
          status: payments.status,
          amount: payments.amount,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.appointmentId, ids))
        .orderBy(asc(payments.createdAt))
    : [];

  const serviceIds = [
    ...new Set(
      rows
        .map((row) => {
          const match = /^Service ID:\s*(.+)$/.exec(row.details?.trim() ?? "");
          return match?.[1] ?? "";
        })
        .filter(Boolean),
    ),
  ];
  const services = serviceIds.length
    ? await db
        .select({ id: tattooServices.id, name: tattooServices.name })
        .from(tattooServices)
        .where(inArray(tattooServices.id, serviceIds))
    : [];
  const serviceNames = new Map(
    services.map((service) => [service.id, service.name]),
  );
  const paymentByBooking = new Map<number, { status: string; paid: number }>();
  for (const payment of paymentRows) {
    const value = paymentByBooking.get(payment.appointmentId) ?? {
      status: payment.status,
      paid: 0,
    };
    value.status = payment.status;
    if (payment.status === "PAID") value.paid += Number(payment.amount);
    paymentByBooking.set(payment.appointmentId, value);
  }

  return rows.map((row) => {
    const serviceId = /^Service ID:\s*(.+)$/.exec(
      row.details?.trim() ?? "",
    )?.[1];
    const payment = paymentByBooking.get(row.id);
    return {
      ...row,
      date: String(row.date),
      startTime: row.startTime.slice(0, 5),
      endTime: row.endTime.slice(0, 5),
      service: serviceId ? (serviceNames.get(serviceId) ?? serviceId) : "-",
      agreedPrice: String(row.agreedPrice),
      depositAmount: String(row.depositAmount),
      paymentStatus: payment?.status ?? null,
      paidAmount: String(payment?.paid ?? 0),
    };
  });
}
