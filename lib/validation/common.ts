import { z } from "zod";

export const uuidSchema = z.uuid();

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80, "Too long");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(254));

/** Strips spaces, dashes, dots and brackets; keeps a leading "+". */
export function normalizePhone(value: string): string {
  return value.trim().replace(/[\s\-().]/g, "");
}

// Thai numbers (0X…, 9–10 digits) or international E.164 (+ and 8–15 digits).
const PHONE_PATTERN = /^(0\d{8,9}|\+\d{8,15})$/;

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .regex(PHONE_PATTERN, "Enter a Thai (0…) or international (+…) number"),
  );

export const dateSchema = z.iso.date();

/** "HH:MM" or "HH:MM:SS" → "HH:MM:00" */
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:00)?$/, "Use HH:MM")
  .transform((value) => `${value.slice(0, 5)}:00`);

export const sortOrderSchema = z.array(uuidSchema).max(500);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()
    .optional();
