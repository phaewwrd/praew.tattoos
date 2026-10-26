import { z } from "zod";
import { bookingStatusValues } from "@/db/app-schema";
import {
  dateSchema,
  emailSchema,
  optionalText,
  personNameSchema,
  phoneSchema,
  timeSchema,
  uuidSchema,
} from "./common";

export const contactFieldsSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

export type ContactFields = z.input<typeof contactFieldsSchema>;

export const bookingRequestSchema = contactFieldsSchema.extend({
  slotId: uuidSchema,
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional(),
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;

export const bookingStatusSchema = z.enum(bookingStatusValues);

export const adminBookingSchema = contactFieldsSchema.extend({
  date: dateSchema,
  time: timeSchema,
  serviceId: uuidSchema.nullable().optional(),
  adminNote: optionalText(2000),
  status: bookingStatusSchema.default("confirmed"),
});

export const updateBookingSchema = z.object({
  id: uuidSchema,
  status: bookingStatusSchema,
  serviceId: uuidSchema.nullable(),
  adminNote: optionalText(2000),
});

/** Client-side form shape (empty strings instead of nulls). */
export const adminBookingFormSchema = contactFieldsSchema.extend({
  date: dateSchema,
  time: timeSchema,
  serviceId: z.string(),
  adminNote: z.string().max(2000),
  status: bookingStatusSchema,
});
