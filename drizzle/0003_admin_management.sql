ALTER TABLE "appointments" DROP CONSTRAINT "appointments_slot_id_unique";--> statement-breakpoint
ALTER TYPE "public"."appointment_status" RENAME VALUE 'PENDING' TO 'PENDING_PAYMENT';--> statement-breakpoint
ALTER TABLE "tattoo_services" ALTER COLUMN "duration_minutes" SET DEFAULT 60;--> statement-breakpoint
UPDATE "tattoo_services" SET "duration_minutes" = 60 WHERE "duration_minutes" IS NULL;--> statement-breakpoint
ALTER TABLE "tattoo_services" ALTER COLUMN "duration_minutes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "agreed_price" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "deposit_amount" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "appointments" AS appointment SET "agreed_price" = service."price_from", "deposit_amount" = service."deposit_amount" FROM "tattoo_services" AS service WHERE appointment."details" = 'Service ID: ' || service."id";--> statement-breakpoint
UPDATE "slots" AS slot SET "status" = 'BOOKED' FROM "appointments" AS appointment WHERE appointment."slot_id" = slot."id" AND appointment."status" <> 'CANCELLED';