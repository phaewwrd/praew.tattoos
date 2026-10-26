import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type ServiceImage, serviceImages, services } from "@/db/schema";

export type ServiceWithImages = {
  id: string;
  name: string;
  priceThb: number;
  sortOrder: number;
  images: Pick<
    ServiceImage,
    "id" | "url" | "publicId" | "alt" | "width" | "height"
  >[];
};

export async function listServices(): Promise<ServiceWithImages[]> {
  return db.query.services.findMany({
    orderBy: [asc(services.sortOrder), asc(services.createdAt)],
    columns: { id: true, name: true, priceThb: true, sortOrder: true },
    with: {
      images: {
        orderBy: [asc(serviceImages.sortOrder), asc(serviceImages.createdAt)],
        columns: {
          id: true,
          url: true,
          publicId: true,
          alt: true,
          width: true,
          height: true,
        },
      },
    },
  });
}

export async function listServiceOptions() {
  return db
    .select({ id: services.id, name: services.name })
    .from(services)
    .orderBy(asc(services.sortOrder));
}

/** Writes sort_order = position for the given ids (one statement per row, in a transaction). */
export async function applyOrder(
  table: typeof services | typeof serviceImages,
  ids: string[],
) {
  await db.transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.update(table).set({ sortOrder: index }).where(eq(table.id, id));
    }
  });
}
