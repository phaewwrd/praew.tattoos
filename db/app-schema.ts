import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// All timestamps are stored in UTC (timestamptz) and rendered in Asia/Bangkok.
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// ---------------------------------------------------------------------------
// Site settings (single row, id = 1)
// ---------------------------------------------------------------------------

export const siteSettings = pgTable(
  "site_settings",
  {
    id: smallint("id").primaryKey().default(1),
    studioName: text("studio_name").notNull(),
    city: text("city").notNull(),
    locationNote: text("location_note").notNull(),
    mrtInfo: text("mrt_info").notNull(),
    mapUrl: text("map_url").notNull(),
    openingHours: text("opening_hours").notNull(),
    instagramHandle: text("instagram_handle").notNull(),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp").notNull(),
    email: text("email").notNull(),
    heartImageUrl: text("heart_image_url"),
    heartImagePublicId: text("heart_image_public_id"),
    // Instagram long-lived token. Never select these columns for public pages.
    instagramToken: text("instagram_token"),
    instagramTokenExpiresAt: timestamp("instagram_token_expires_at", {
      withTimezone: true,
    }),
    instagramTokenRefreshedAt: timestamp("instagram_token_refreshed_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (t) => [check("site_settings_singleton", sql`${t.id} = 1`)],
);

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    priceThb: integer("price_thb").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("services_name_unique").on(t.name),
    index("services_sort_order_idx").on(t.sortOrder),
    check("services_price_non_negative", sql`${t.priceThb} >= 0`),
  ],
);

export const serviceImages = pgTable(
  "service_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    alt: text("alt").default("").notNull(),
    width: integer("width"),
    height: integer("height"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("service_images_service_idx").on(t.serviceId, t.sortOrder)],
);

// ---------------------------------------------------------------------------
// Slots: one-hour appointment slots opened by the admin (Bangkok local time)
// ---------------------------------------------------------------------------

export const slots = pgTable(
  "slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    isOpen: boolean("is_open").default(true).notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [uniqueIndex("slots_date_start_unique").on(t.date, t.startTime)],
);

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    // Stored normalized: email lower-cased, phone as digits with optional leading "+".
    email: text("email"),
    phone: text("phone"),
    ...timestamps,
  },
  (t) => [
    index("customers_email_idx").on(t.email),
    index("customers_phone_idx").on(t.phone),
    index("customers_name_idx").on(t.lastName, t.firstName),
  ],
);

export const customerNotes = pgTable(
  "customer_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("customer_notes_customer_idx").on(t.customerId, t.createdAt)],
);

export const customerTags = pgTable(
  "customer_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [uniqueIndex("customer_tags_name_unique").on(sql`lower(${t.name})`)],
);

export const customerTagLinks = pgTable(
  "customer_tag_links",
  {
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => customerTags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.customerId, t.tagId] }),
    index("customer_tag_links_tag_idx").on(t.tagId),
  ],
);

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export const bookingStatusValues = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const bookingStatus = pgEnum("booking_status", bookingStatusValues);

export const bookingSourceValues = ["website", "admin"] as const;

export const bookingSource = pgEnum("booking_source", bookingSourceValues);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "restrict" }),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    status: bookingStatus("status").default("pending").notNull(),
    source: bookingSource("source").default("website").notNull(),
    adminNote: text("admin_note"),
    ...timestamps,
  },
  (t) => [
    // Exactly one active (pending/confirmed) booking per slot.
    uniqueIndex("bookings_active_slot_unique")
      .on(t.slotId)
      .where(sql`${t.status} in ('pending', 'confirmed')`),
    index("bookings_customer_idx").on(t.customerId),
    index("bookings_status_idx").on(t.status),
    index("bookings_created_at_idx").on(t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (t) => [index("faqs_sort_order_idx").on(t.sortOrder)],
);

// Decorative calendar image per month of the year (1-12), reused every year.
export const monthImages = pgTable(
  "month_images",
  {
    month: smallint("month").primaryKey(),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    alt: text("alt").default("").notNull(),
    updatedAt: timestamps.updatedAt,
  },
  (t) => [check("month_images_month_range", sql`${t.month} between 1 and 12`)],
);

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

export type InstagramPost = {
  id: string;
  permalink: string;
  imageUrl: string;
  caption: string | null;
  timestamp: string;
};

// Last successful fetch (single row, id = 1).
export const instagramCache = pgTable(
  "instagram_cache",
  {
    id: smallint("id").primaryKey().default(1),
    posts: jsonb("posts").$type<InstagramPost[]>().notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  },
  (t) => [check("instagram_cache_singleton", sql`${t.id} = 1`)],
);

export const instagramFallbackImages = pgTable(
  "instagram_fallback_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    alt: text("alt").default("").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("instagram_fallback_sort_idx").on(t.sortOrder)],
);

// ---------------------------------------------------------------------------
// Rate limiting for public endpoints (fixed window per key)
// ---------------------------------------------------------------------------

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  hits: integer("hits").notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const servicesRelations = relations(services, ({ many }) => ({
  images: many(serviceImages),
  bookings: many(bookings),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id],
  }),
}));

export const slotsRelations = relations(slots, ({ many }) => ({
  bookings: many(bookings),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
  notes: many(customerNotes),
  tagLinks: many(customerTagLinks),
}));

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  customer: one(customers, {
    fields: [customerNotes.customerId],
    references: [customers.id],
  }),
}));

export const customerTagsRelations = relations(customerTags, ({ many }) => ({
  links: many(customerTagLinks),
}));

export const customerTagLinksRelations = relations(
  customerTagLinks,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerTagLinks.customerId],
      references: [customers.id],
    }),
    tag: one(customerTags, {
      fields: [customerTagLinks.tagId],
      references: [customerTags.id],
    }),
  }),
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
  slot: one(slots, { fields: [bookings.slotId], references: [slots.id] }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookingStatus = (typeof bookingStatusValues)[number];
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type MonthImage = typeof monthImages.$inferSelect;
export type InstagramFallbackImage =
  typeof instagramFallbackImages.$inferSelect;
