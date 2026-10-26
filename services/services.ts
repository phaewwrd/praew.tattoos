import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tattooServices as tattooServicesTable } from "@/db/tattoo-schema";

export type TattooService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceFrom: number;
  depositAmount: number;
  durationMinutes?: number;
  isActive: boolean;
  sortOrder: number;
};

export async function getTattooServices(options?: {
  onlyActive?: boolean;
}): Promise<TattooService[]> {
  const rows = await db
    .select({
      id: tattooServicesTable.id,
      name: tattooServicesTable.name,
      slug: tattooServicesTable.slug,
      description: tattooServicesTable.description,
      priceFrom: tattooServicesTable.priceFrom,
      depositAmount: tattooServicesTable.depositAmount,
      durationMinutes: tattooServicesTable.durationMinutes,
      isActive: tattooServicesTable.isActive,
      sortOrder: tattooServicesTable.sortOrder,
    })
    .from(tattooServicesTable)
    .where(
      options?.onlyActive ? eq(tattooServicesTable.isActive, true) : undefined,
    )
    .orderBy(asc(tattooServicesTable.sortOrder), asc(tattooServicesTable.name));

  return rows.map((row) => ({
    ...row,
    priceFrom: Number(row.priceFrom),
    depositAmount: Number(row.depositAmount),
    durationMinutes: row.durationMinutes ?? undefined,
  }));
}
