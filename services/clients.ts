import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, clients, payments, slots } from "@/db/tattoo-schema";
import { getTattooServices } from "@/services/services";

type AppointmentStatus = typeof appointments.$inferSelect.status;
type PaymentStatus = typeof payments.$inferSelect.status;

export type ClientListItem = {
	id: number;
	fullName: string;
	email: string | null;
	phone: string;
	bookingsCount: number;
	latestBookingDate: string | null;
	createdAt: string;
	isArchived: boolean;
};

export type ClientBooking = {
	id: number;
	service: string;
	date: string;
	time: string;
	status: AppointmentStatus;
	paymentStatus: PaymentStatus | null;
	agreedPrice: string;
	depositAmount: string;
	paidAmount: string;
};

export type ClientDetail = {
	id: number;
	fullName: string;
	email: string | null;
	phone: string;
	createdAt: string;
	isArchived: boolean;
	bookings: ClientBooking[];
};

function toIsoDateTime(value: unknown): string {
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	return "";
}

function normalizeDate(value: unknown): string {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return "";
}

function normalizeTime(value: unknown): string {
	if (typeof value !== "string") return "";
	return value.slice(0, 5);
}

// Booking (F04) stores the selected service as free text, e.g. "Service ID: <id>".
function extractServiceId(details: string | null): string | null {
	if (!details) return null;
	const match = /^Service ID:\s*(.+)$/.exec(details.trim());
	return match ? match[1] : null;
}

export async function getClients(options?: {
	query?: string;
	includeArchived?: boolean;
}): Promise<ClientListItem[]> {
	const term = options?.query?.trim();
	const whereClause = term
		? or(
				ilike(clients.name, `%${term}%`),
				ilike(clients.email, `%${term}%`),
				ilike(clients.phone, `%${term}%`),
			)
		: undefined;

	const rows = await db
		.select({
			id: clients.id,
			fullName: clients.name,
			email: clients.email,
			phone: clients.phone,
			createdAt: clients.createdAt,
			isArchived: clients.isArchived,
			bookingsCount: sql<number>`count(${appointments.id})::int`,
			latestBookingDate: sql<string | null>`max(${slots.date})`,
		})
		.from(clients)
		.leftJoin(appointments, eq(appointments.clientId, clients.id))
		.leftJoin(slots, eq(slots.id, appointments.slotId))
		.where(
			options?.includeArchived
				? whereClause
				: whereClause
					? and(whereClause, eq(clients.isArchived, false))
					: eq(clients.isArchived, false),
		)
		.groupBy(clients.id)
		.orderBy(desc(clients.createdAt));

	return rows.map((row) => ({
		...row,
		createdAt: toIsoDateTime(row.createdAt),
		latestBookingDate: row.latestBookingDate,
	}));
}

export async function getClientDetail(
	id: number,
): Promise<ClientDetail | null> {
	const clientRows = await db
		.select({
			id: clients.id,
			fullName: clients.name,
			email: clients.email,
			phone: clients.phone,
			createdAt: clients.createdAt,
			isArchived: clients.isArchived,
		})
		.from(clients)
		.where(eq(clients.id, id))
		.limit(1);

	const client = clientRows[0];
	if (!client) return null;

	const bookingRows = await db
		.select({
			id: appointments.id,
			details: appointments.details,
			date: slots.date,
			time: slots.startTime,
			status: appointments.status,
			agreedPrice: appointments.agreedPrice,
			depositAmount: appointments.depositAmount,
		})
		.from(appointments)
		.innerJoin(slots, eq(slots.id, appointments.slotId))
		.where(eq(appointments.clientId, id))
		.orderBy(desc(slots.date), desc(slots.startTime));

	const appointmentIds = bookingRows.map((row) => row.id);

	const paymentRows = appointmentIds.length
		? await db
				.select({
					appointmentId: payments.appointmentId,
					status: payments.status,
					amount: payments.amount,
					createdAt: payments.createdAt,
				})
				.from(payments)
				.where(inArray(payments.appointmentId, appointmentIds))
				.orderBy(asc(payments.createdAt))
		: [];

	const latestPaymentByAppointment = new Map<number, PaymentStatus>();
	const paidAmountByAppointment = new Map<number, number>();
	for (const payment of paymentRows) {
		latestPaymentByAppointment.set(payment.appointmentId, payment.status);
		if (payment.status === "PAID")
			paidAmountByAppointment.set(
				payment.appointmentId,
				(paidAmountByAppointment.get(payment.appointmentId) ?? 0) +
					Number(payment.amount),
			);
	}

	const services = await getTattooServices();
	const serviceNameById = new Map(
		services.map((service) => [service.id, service.name]),
	);

	const bookings: ClientBooking[] = bookingRows.map((row) => {
		const serviceId = extractServiceId(row.details);
		const service = serviceId
			? (serviceNameById.get(serviceId) ?? serviceId)
			: "-";

		return {
			id: row.id,
			service,
			date: normalizeDate(row.date),
			time: normalizeTime(row.time),
			status: row.status,
			paymentStatus: latestPaymentByAppointment.get(row.id) ?? null,
			agreedPrice: String(row.agreedPrice),
			depositAmount: String(row.depositAmount),
			paidAmount: String(paidAmountByAppointment.get(row.id) ?? 0),
		};
	});

	return {
		id: client.id,
		fullName: client.fullName,
		email: client.email,
		phone: client.phone,
		createdAt: toIsoDateTime(client.createdAt),
		isArchived: client.isArchived,
		bookings,
	};
}
