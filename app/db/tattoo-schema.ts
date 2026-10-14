import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	decimal,
	integer,
	pgEnum,
	pgTable,
	text,
	time,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

// ========================================
// ENUMS
// ========================================

export const slotStatusEnum = pgEnum("slot_status", [
	"AVAILABLE",
	"BOOKED",
	"BLOCKED",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
	"PENDING_PAYMENT",
	"CONFIRMED",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"PENDING",
	"PAID",
	"REFUNDED",
]);

// ========================================
// TATTOO ARTISTS
// ========================================

export const tattooArtists = pgTable("tattoo_artists", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	name: varchar("name", {
		length: 100,
	}).notNull(),

	phone: varchar("phone", {
		length: 20,
	}),

	email: varchar("email", {
		length: 255,
	}),

	bio: text("bio"),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// ========================================
// PORTFOLIOS
// ========================================

export const portfolios = pgTable("portfolios", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	artistId: integer("artist_id")
		.notNull()
		.references(() => tattooArtists.id, {
			onDelete: "cascade",
		}),

	title: varchar("title", {
		length: 150,
	}).notNull(),

	imageUrl: varchar("image_url", {
		length: 500,
	}).notNull(),

	imagePublicId: varchar("image_public_id", {
		length: 255,
	}),

	details: text("details"),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// ========================================
// TATTOO SERVICES
// ========================================

export const tattooServices = pgTable("tattoo_services", {
	id: varchar("id", {
		length: 100,
	}).primaryKey(),

	name: varchar("name", {
		length: 150,
	}).notNull(),

	slug: varchar("slug", {
		length: 160,
	})
		.notNull()
		.unique(),

	description: text("description").notNull(),

	priceFrom: decimal("price_from", { precision: 10, scale: 2 }).notNull(),

	depositAmount: decimal("deposit_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),

	durationMinutes: integer("duration_minutes").default(60).notNull(),

	isActive: boolean("is_active").default(true).notNull(),

	sortOrder: integer("sort_order").default(0).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// ========================================
// BOOKING SLOTS
// ========================================

export const slots = pgTable(
	"slots",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

		artistId: integer("artist_id")
			.notNull()
			.references(() => tattooArtists.id, {
				onDelete: "cascade",
			}),

		date: date("date").notNull(),

		startTime: time("start_time").notNull(),

		endTime: time("end_time").notNull(),

		status: slotStatusEnum("status").default("AVAILABLE").notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		unique("slots_artist_date_start_unique").on(
			table.artistId,
			table.date,
			table.startTime,
		),
	],
);

export const scheduleDateBlocks = pgTable(
	"schedule_date_blocks",
	{
		artistId: integer("artist_id")
			.notNull()
			.references(() => tattooArtists.id, {
				onDelete: "cascade",
			}),

		date: date("date").notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		unique("schedule_date_blocks_artist_date_unique").on(
			table.artistId,
			table.date,
		),
	],
);

// ========================================
// CLIENTS
// ========================================

export const clients = pgTable("clients", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	name: varchar("name", {
		length: 100,
	}).notNull(),

	phone: varchar("phone", {
		length: 20,
	}).notNull(),

	email: varchar("email", {
		length: 255,
	}),

	isArchived: boolean("is_archived").default(false).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// ========================================
// APPOINTMENTS
// ========================================

export const appointments = pgTable("appointments", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	clientId: integer("client_id")
		.notNull()
		.references(() => clients.id, {
			onDelete: "restrict",
		}),

	slotId: integer("slot_id")
		.notNull()
		.references(() => slots.id, {
			onDelete: "restrict",
		}),

	status: appointmentStatusEnum("status").default("PENDING_PAYMENT").notNull(),

	details: text("details"),

	agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }).notNull(),

	depositAmount: decimal("deposit_amount", {
		precision: 10,
		scale: 2,
	}).notNull(),

	notes: text("notes"),

	placement: varchar("placement", {
		length: 100,
	}),

	size: varchar("size", {
		length: 100,
	}),

	referenceImageUrl: varchar("reference_image_url", {
		length: 500,
	}),

	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

// ========================================
// PAYMENTS
// ========================================

export const payments = pgTable("payments", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	appointmentId: integer("appointment_id")
		.notNull()
		.references(() => appointments.id, {
			onDelete: "restrict",
		}),

	amount: decimal("amount", {
		precision: 10,
		scale: 2,
	}).notNull(),

	status: paymentStatusEnum("status").default("PENDING").notNull(),

	paymentMethod: varchar("payment_method", {
		length: 30,
	}),

	paidAt: timestamp("paid_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========================================
// CONTACT MESSAGES
// ========================================

export const contactMessages = pgTable("contact_messages", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

	name: varchar("name", {
		length: 100,
	}).notNull(),

	phone: varchar("phone", {
		length: 20,
	}),

	email: varchar("email", {
		length: 255,
	}).notNull(),

	message: text("message").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ========================================
// RELATIONS
// ========================================

export const tattooArtistsRelations = relations(tattooArtists, ({ many }) => ({
	portfolios: many(portfolios),
	slots: many(slots),
	scheduleDateBlocks: many(scheduleDateBlocks),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
	artist: one(tattooArtists, {
		fields: [portfolios.artistId],
		references: [tattooArtists.id],
	}),
}));

export const slotsRelations = relations(slots, ({ one }) => ({
	artist: one(tattooArtists, {
		fields: [slots.artistId],
		references: [tattooArtists.id],
	}),

	appointment: one(appointments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
	appointments: many(appointments),
}));

export const appointmentsRelations = relations(
	appointments,
	({ one, many }) => ({
		client: one(clients, {
			fields: [appointments.clientId],
			references: [clients.id],
		}),

		slot: one(slots, {
			fields: [appointments.slotId],
			references: [slots.id],
		}),

		payments: many(payments),
	}),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
	appointment: one(appointments, {
		fields: [payments.appointmentId],
		references: [appointments.id],
	}),
}));

// ========================================
// TYPES
// ========================================

export type TattooArtist = typeof tattooArtists.$inferSelect;

export type NewTattooArtist = typeof tattooArtists.$inferInsert;

export type Portfolio = typeof portfolios.$inferSelect;

export type NewPortfolio = typeof portfolios.$inferInsert;

export type TattooService = typeof tattooServices.$inferSelect;

export type NewTattooService = typeof tattooServices.$inferInsert;

export type Slot = typeof slots.$inferSelect;

export type NewSlot = typeof slots.$inferInsert;

export type Client = typeof clients.$inferSelect;

export type NewClient = typeof clients.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;

export type NewAppointment = typeof appointments.$inferInsert;

export type Payment = typeof payments.$inferSelect;

export type NewPayment = typeof payments.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;

export type NewContactMessage = typeof contactMessages.$inferInsert;
