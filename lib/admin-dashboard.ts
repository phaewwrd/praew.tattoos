import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/app/db";
import {
  appointments,
  clients,
  contactMessages,
  payments,
  slots,
} from "@/app/db/tattoo-schema";

type AppointmentStatus = typeof appointments.$inferSelect.status;

export type DashboardBooking = {
  id: number;
  clientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type DashboardMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type DashboardData = {
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  pendingPaymentsCount: number;
  recentBookings: DashboardBooking[];
  recentMessages: DashboardMessage[];
  todayAppointments: DashboardBooking[];
  upcomingAppointments: DashboardBooking[];
  bookingStatusSummary: Array<{
    status: AppointmentStatus;
    count: number;
  }>;
  isMockData: boolean;
};

function toIsoDate(input: Date): string {
  return input.toISOString().slice(0, 10);
}

function createMockDashboardData(): DashboardData {
  return {
    todayAppointmentsCount: 2,
    upcomingAppointmentsCount: 6,
    pendingPaymentsCount: 3,
    recentBookings: [
      {
        id: 1001,
        clientName: "Nina S.",
        date: "2026-09-27",
        time: "13:00",
        status: "PENDING_PAYMENT",
        createdAt: "2026-09-25T10:20:00.000Z",
      },
      {
        id: 1000,
        clientName: "Korn P.",
        date: "2026-09-26",
        time: "11:00",
        status: "CONFIRMED",
        createdAt: "2026-09-24T09:00:00.000Z",
      },
    ],
    recentMessages: [
      {
        id: 901,
        name: "Mali",
        email: "mali@example.com",
        message: "Hi, I want to book a floral sleeve next month.",
        createdAt: "2026-09-25T06:00:00.000Z",
      },
      {
        id: 900,
        name: "Pat",
        email: "pat@example.com",
        message: "Do you have available slots this weekend?",
        createdAt: "2026-09-24T14:35:00.000Z",
      },
    ],
    todayAppointments: [
      {
        id: 1000,
        clientName: "Korn P.",
        date: "2026-09-26",
        time: "11:00",
        status: "CONFIRMED",
        createdAt: "2026-09-24T09:00:00.000Z",
      },
      {
        id: 999,
        clientName: "Aum",
        date: "2026-09-26",
        time: "16:00",
        status: "PENDING_PAYMENT",
        createdAt: "2026-09-23T11:30:00.000Z",
      },
    ],
    upcomingAppointments: [
      {
        id: 1001,
        clientName: "Nina S.",
        date: "2026-09-27",
        time: "13:00",
        status: "PENDING_PAYMENT",
        createdAt: "2026-09-25T10:20:00.000Z",
      },
      {
        id: 1002,
        clientName: "Beam R.",
        date: "2026-09-29",
        time: "10:30",
        status: "CONFIRMED",
        createdAt: "2026-09-25T12:00:00.000Z",
      },
    ],
    bookingStatusSummary: [
      { status: "PENDING_PAYMENT", count: 3 },
      { status: "CONFIRMED", count: 2 },
      { status: "COMPLETED", count: 1 },
      { status: "CANCELLED", count: 0 },
      { status: "NO_SHOW", count: 0 },
    ],
    isMockData: true,
  };
}

function normalizeBookingDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return toIsoDate(value);
  return "";
}

function normalizeTime(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.slice(0, 5);
}

function toIsoDateTime(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function getAdminDashboardData(): Promise<DashboardData> {
  const today = new Date();
  const upcomingCutoff = new Date(today);
  upcomingCutoff.setDate(today.getDate() + 14);

  const todayIso = toIsoDate(today);
  const upcomingCutoffIso = toIsoDate(upcomingCutoff);

  try {
    const [
      todayAppointments,
      upcomingAppointments,
      pendingPayments,
      recentBookings,
      recentMessages,
      statusSummary,
    ] = await Promise.all([
      db
        .select({
          id: appointments.id,
          clientName: clients.name,
          date: slots.date,
          time: slots.startTime,
          status: appointments.status,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(clients, eq(clients.id, appointments.clientId))
        .innerJoin(slots, eq(slots.id, appointments.slotId))
        .where(eq(slots.date, todayIso))
        .orderBy(slots.startTime),
      db
        .select({
          id: appointments.id,
          clientName: clients.name,
          date: slots.date,
          time: slots.startTime,
          status: appointments.status,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(clients, eq(clients.id, appointments.clientId))
        .innerJoin(slots, eq(slots.id, appointments.slotId))
        .where(
          and(
            gte(slots.date, todayIso),
            lte(slots.date, upcomingCutoffIso),
            inArray(appointments.status, ["PENDING_PAYMENT", "CONFIRMED"]),
          ),
        )
        .orderBy(slots.date, slots.startTime),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(payments)
        .where(eq(payments.status, "PENDING")),
      db
        .select({
          id: appointments.id,
          clientName: clients.name,
          date: slots.date,
          time: slots.startTime,
          status: appointments.status,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(clients, eq(clients.id, appointments.clientId))
        .innerJoin(slots, eq(slots.id, appointments.slotId))
        .orderBy(desc(appointments.createdAt))
        .limit(8),
      db
        .select({
          id: contactMessages.id,
          name: contactMessages.name,
          email: contactMessages.email,
          message: contactMessages.message,
          createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(8),
      db
        .select({
          status: appointments.status,
          count: sql<number>`count(*)::int`,
        })
        .from(appointments)
        .groupBy(appointments.status),
    ]);

    const normalizedTodayAppointments: DashboardBooking[] = todayAppointments.map((row) => ({
      id: row.id,
      clientName: row.clientName,
      date: normalizeBookingDate(row.date),
      time: normalizeTime(row.time),
      status: row.status,
      createdAt: toIsoDateTime(row.createdAt),
    }));

    const normalizedUpcomingAppointments: DashboardBooking[] = upcomingAppointments.map((row) => ({
      id: row.id,
      clientName: row.clientName,
      date: normalizeBookingDate(row.date),
      time: normalizeTime(row.time),
      status: row.status,
      createdAt: toIsoDateTime(row.createdAt),
    }));

    const normalizedRecentBookings: DashboardBooking[] = recentBookings.map((row) => ({
      id: row.id,
      clientName: row.clientName,
      date: normalizeBookingDate(row.date),
      time: normalizeTime(row.time),
      status: row.status,
      createdAt: toIsoDateTime(row.createdAt),
    }));

    const normalizedRecentMessages: DashboardMessage[] = recentMessages.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: toIsoDateTime(row.createdAt),
    }));

    const normalizedStatusSummary = statusSummary.map((row) => ({
      status: row.status,
      count: Number(row.count),
    }));

    return {
      todayAppointmentsCount: normalizedTodayAppointments.length,
      upcomingAppointmentsCount: normalizedUpcomingAppointments.length,
      pendingPaymentsCount: Number(pendingPayments[0]?.count ?? 0),
      recentBookings: normalizedRecentBookings,
      recentMessages: normalizedRecentMessages,
      todayAppointments: normalizedTodayAppointments,
      upcomingAppointments: normalizedUpcomingAppointments,
      bookingStatusSummary: normalizedStatusSummary,
      isMockData: false,
    };
  } catch {
    return createMockDashboardData();
  }
}
