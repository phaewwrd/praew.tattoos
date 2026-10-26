"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { serviceImages, services } from "@/db/schema";
import { createAction } from "@/lib/action";
import { deleteImage, isOwnUpload } from "@/lib/cloudinary";
import { ActionError } from "@/lib/server-response";
import {
  imageAltSchema,
  reorderSchema,
  serviceImageSchema,
  serviceSchema,
  updateServiceSchema,
} from "@/lib/validation/admin";
import { uuidSchema } from "@/lib/validation/common";
import { applyOrder } from "@/server/services";

const revalidate = ["/", "/admin/services"];

export const createServiceAction = createAction(
  serviceSchema,
  async (input) => {
    const [{ next }] = await db
      .select({
        next: sql<number>`coalesce(max(${services.sortOrder}) + 1, 0)::int`,
      })
      .from(services);
    await db.insert(services).values({ ...input, sortOrder: next });
  },
  { revalidate },
);

export const updateServiceAction = createAction(
  updateServiceSchema,
  async ({ id, ...values }) => {
    await db.update(services).set(values).where(eq(services.id, id));
  },
  { revalidate },
);

export const deleteServiceAction = createAction(
  z.object({ id: uuidSchema }),
  async ({ id }) => {
    const images = await db
      .delete(serviceImages)
      .where(eq(serviceImages.serviceId, id))
      .returning({ publicId: serviceImages.publicId });
    await db.delete(services).where(eq(services.id, id));
    await Promise.all(images.map((image) => deleteImage(image.publicId)));
  },
  { revalidate },
);

export const reorderServicesAction = createAction(
  reorderSchema,
  async ({ ids }) => applyOrder(services, ids),
  { revalidate },
);

export const addServiceImagesAction = createAction(
  z.object({
    serviceId: uuidSchema,
    images: z
      .array(serviceImageSchema.omit({ serviceId: true }))
      .min(1)
      .max(50),
  }),
  async ({ serviceId, images }) => {
    if (!images.every((image) => isOwnUpload(image, "services"))) {
      throw new ActionError("INVALID_INPUT", "Unexpected image source.");
    }
    const [{ next }] = await db
      .select({
        next: sql<number>`coalesce(max(${serviceImages.sortOrder}) + 1, 0)::int`,
      })
      .from(serviceImages)
      .where(eq(serviceImages.serviceId, serviceId));
    await db.insert(serviceImages).values(
      images.map((image, i) => ({
        ...image,
        serviceId,
        sortOrder: next + i,
      })),
    );
  },
  { revalidate },
);

export const updateServiceImageAltAction = createAction(
  imageAltSchema,
  async ({ id, alt }) => {
    await db.update(serviceImages).set({ alt }).where(eq(serviceImages.id, id));
  },
  { revalidate },
);

export const deleteServiceImageAction = createAction(
  z.object({ id: uuidSchema }),
  async ({ id }) => {
    const [image] = await db
      .delete(serviceImages)
      .where(eq(serviceImages.id, id))
      .returning({ publicId: serviceImages.publicId });
    if (image) await deleteImage(image.publicId);
  },
  { revalidate },
);

export const reorderServiceImagesAction = createAction(
  z.object({ serviceId: uuidSchema, ids: reorderSchema.shape.ids }),
  async ({ serviceId, ids }) => {
    const owned = await db
      .select({ id: serviceImages.id })
      .from(serviceImages)
      .where(
        and(
          eq(serviceImages.serviceId, serviceId),
          inArray(serviceImages.id, ids),
        ),
      );
    if (owned.length !== ids.length)
      throw new ActionError("INVALID_INPUT", "Unknown image.");
    await applyOrder(serviceImages, ids);
  },
  { revalidate },
);
