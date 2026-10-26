"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { monthImages, siteSettings } from "@/db/schema";
import { createAction } from "@/lib/action";
import { deleteImage, isOwnUpload } from "@/lib/cloudinary";
import { ActionError } from "@/lib/server-response";
import { monthImageSchema, uploadedImageSchema } from "@/lib/validation/admin";
import { updateSettings } from "@/server/settings";

const revalidate = ["/", "/admin/calendar-images"];

export const setMonthImageAction = createAction(
  monthImageSchema,
  async ({ month, url, publicId }) => {
    if (!isOwnUpload({ url, publicId }, "calendar")) {
      throw new ActionError("INVALID_INPUT", "Unexpected image source.");
    }
    const [previous] = await db
      .select()
      .from(monthImages)
      .where(eq(monthImages.month, month));
    await db
      .insert(monthImages)
      .values({ month, url, publicId })
      .onConflictDoUpdate({
        target: monthImages.month,
        set: { url, publicId },
      });
    if (previous) await deleteImage(previous.publicId);
  },
  { revalidate },
);

export const removeMonthImageAction = createAction(
  z.object({ month: z.number().int().min(1).max(12) }),
  async ({ month }) => {
    const [removed] = await db
      .delete(monthImages)
      .where(eq(monthImages.month, month))
      .returning({ publicId: monthImages.publicId });
    if (removed) await deleteImage(removed.publicId);
  },
  { revalidate },
);

export const setHeartImageAction = createAction(
  uploadedImageSchema.nullable(),
  async (image) => {
    if (image && !isOwnUpload(image, "calendar")) {
      throw new ActionError("INVALID_INPUT", "Unexpected image source.");
    }
    const [current] = await db
      .select({ publicId: siteSettings.heartImagePublicId })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1));
    await updateSettings({
      heartImageUrl: image?.url ?? null,
      heartImagePublicId: image?.publicId ?? null,
    });
    if (current?.publicId) await deleteImage(current.publicId);
  },
  { revalidate },
);
