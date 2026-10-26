"use server";

import { eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { instagramFallbackImages } from "@/db/schema";
import { createAction } from "@/lib/action";
import { auth } from "@/lib/auth";
import { deleteImage, isOwnUpload } from "@/lib/cloudinary";
import { ActionError } from "@/lib/server-response";
import {
  changePasswordSchema,
  instagramTokenSchema,
  reorderSchema,
  siteSettingsSchema,
  uploadedImageSchema,
} from "@/lib/validation/admin";
import { uuidSchema } from "@/lib/validation/common";
import { INSTAGRAM_CACHE_TAG, saveInstagramToken } from "@/server/instagram";
import { updateSettings } from "@/server/settings";

export const updateSettingsAction = createAction(
  siteSettingsSchema,
  async (values) => updateSettings(values),
  { revalidate: ["/", "/faq", "/admin/settings"] },
);

export const saveInstagramTokenAction = createAction(
  instagramTokenSchema,
  async ({ token }) => {
    await saveInstagramToken(token);
    revalidateTag(INSTAGRAM_CACHE_TAG, { expire: 0 });
  },
  { revalidate: ["/", "/admin/settings"] },
);

export const addFallbackImagesAction = createAction(
  z.object({ images: z.array(uploadedImageSchema).min(1).max(30) }),
  async ({ images }) => {
    if (!images.every((image) => isOwnUpload(image, "instagram-fallback"))) {
      throw new ActionError("INVALID_INPUT", "Unexpected image source.");
    }
    const [{ next }] = await db
      .select({
        next: sql<number>`coalesce(max(${instagramFallbackImages.sortOrder}) + 1, 0)::int`,
      })
      .from(instagramFallbackImages);
    await db.insert(instagramFallbackImages).values(
      images.map(({ url, publicId }, i) => ({
        url,
        publicId,
        sortOrder: next + i,
      })),
    );
    revalidateTag(INSTAGRAM_CACHE_TAG, { expire: 0 });
  },
  { revalidate: ["/", "/admin/settings"] },
);

export const deleteFallbackImageAction = createAction(
  z.object({ id: uuidSchema }),
  async ({ id }) => {
    const [removed] = await db
      .delete(instagramFallbackImages)
      .where(eq(instagramFallbackImages.id, id))
      .returning({ publicId: instagramFallbackImages.publicId });
    if (removed) await deleteImage(removed.publicId);
    revalidateTag(INSTAGRAM_CACHE_TAG, { expire: 0 });
  },
  { revalidate: ["/", "/admin/settings"] },
);

export const reorderFallbackImagesAction = createAction(
  reorderSchema,
  async ({ ids }) => {
    await db.transaction(async (tx) => {
      for (const [index, id] of ids.entries()) {
        await tx
          .update(instagramFallbackImages)
          .set({ sortOrder: index })
          .where(eq(instagramFallbackImages.id, id));
      }
    });
    revalidateTag(INSTAGRAM_CACHE_TAG, { expire: 0 });
  },
  { revalidate: ["/", "/admin/settings"] },
);

export const changePasswordAction = createAction(
  changePasswordSchema,
  async ({ currentPassword, newPassword }) => {
    try {
      await auth.api.changePassword({
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        headers: await headers(),
      });
    } catch {
      throw new ActionError("INVALID_INPUT", "Current password is incorrect.");
    }
  },
);
