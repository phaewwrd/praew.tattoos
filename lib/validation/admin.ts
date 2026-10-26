import { z } from "zod";
import {
  dateSchema,
  emailSchema,
  personNameSchema,
  phoneSchema,
  sortOrderSchema,
  timeSchema,
  uuidSchema,
} from "./common";

// --- Services ---------------------------------------------------------------
export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  priceThb: z.number().int("Whole baht only").min(0).max(1_000_000),
});
export const updateServiceSchema = serviceSchema.extend({ id: uuidSchema });
export const reorderSchema = z.object({ ids: sortOrderSchema });

// --- Uploaded images ----------------------------------------------------------
export const uploadedImageSchema = z.object({
  url: z.url().startsWith("https://res.cloudinary.com/"),
  publicId: z.string().min(1).max(300),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type UploadedImage = z.infer<typeof uploadedImageSchema>;

export const serviceImageSchema = uploadedImageSchema.extend({
  serviceId: uuidSchema,
});
export const imageAltSchema = z.object({
  id: uuidSchema,
  alt: z.string().trim().max(200),
});

// --- Slots -------------------------------------------------------------------
export const setDaySlotsSchema = z.object({
  dates: z.array(dateSchema).min(1).max(62),
  times: z.array(timeSchema).max(48),
  // "replace" removes unbooked slots not in `times`; "add" only adds.
  mode: z.enum(["replace", "add"]),
});
export const copyWeekSchema = z.object({ weekStart: dateSchema });
export const slotIdsSchema = z.object({
  ids: z.array(uuidSchema).min(1).max(500),
});
export const toggleSlotSchema = z.object({
  id: uuidSchema,
  isOpen: z.boolean(),
});

// --- Customers ---------------------------------------------------------------
export const customerSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  email: emailSchema.nullable().or(z.literal("").transform(() => null)),
  phone: phoneSchema.nullable().or(z.literal("").transform(() => null)),
});
export const updateCustomerSchema = customerSchema.extend({ id: uuidSchema });
export const customerNoteSchema = z.object({
  customerId: uuidSchema,
  body: z.string().trim().min(1).max(4000),
});
export const customerTagSchema = z.object({
  customerId: uuidSchema,
  name: z.string().trim().min(1).max(40),
});
export const removeTagSchema = z.object({
  customerId: uuidSchema,
  tagId: uuidSchema,
});

// --- FAQ ---------------------------------------------------------------------
export const faqSchema = z.object({
  question: z.string().trim().min(1, "Required").max(300),
  answer: z.string().trim().min(1, "Required").max(4000),
});
export const updateFaqSchema = faqSchema.extend({ id: uuidSchema });

// --- Calendar images ---------------------------------------------------------
export const monthImageSchema = uploadedImageSchema.extend({
  month: z.number().int().min(1).max(12),
});

// --- Settings ----------------------------------------------------------------
export const siteSettingsSchema = z.object({
  studioName: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(120),
  locationNote: z.string().trim().min(1).max(300),
  mrtInfo: z.string().trim().min(1).max(300),
  mapUrl: z.url(),
  openingHours: z.string().trim().min(1).max(200),
  instagramHandle: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .transform((value) => value.replace(/^@/, "")),
  phone: z.string().trim().min(1).max(40),
  whatsapp: z.string().trim().min(1).max(40),
  email: emailSchema,
});
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;

export const instagramTokenSchema = z.object({
  token: z.string().trim().min(20).max(1000),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8, "At least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
