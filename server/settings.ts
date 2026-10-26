import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";

export type PublicSettings = typeof DEFAULT_SITE_SETTINGS & {
  heartImageUrl: string | null;
};

// Explicit columns: the Instagram token must never reach public pages.
const publicColumns = {
  studioName: siteSettings.studioName,
  city: siteSettings.city,
  locationNote: siteSettings.locationNote,
  mrtInfo: siteSettings.mrtInfo,
  mapUrl: siteSettings.mapUrl,
  openingHours: siteSettings.openingHours,
  instagramHandle: siteSettings.instagramHandle,
  phone: siteSettings.phone,
  whatsapp: siteSettings.whatsapp,
  email: siteSettings.email,
  heartImageUrl: siteSettings.heartImageUrl,
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const [row] = await db
    .select(publicColumns)
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  return row ?? { ...DEFAULT_SITE_SETTINGS, heartImageUrl: null };
}

/** Upserts the singleton row so admin edits work even before seeding. */
export async function updateSettings(
  values: Partial<typeof siteSettings.$inferInsert>,
) {
  await db
    .insert(siteSettings)
    .values({ id: 1, ...DEFAULT_SITE_SETTINGS, ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });
}

export async function getInstagramTokenStatus() {
  const [row] = await db
    .select({
      hasToken: siteSettings.instagramToken,
      expiresAt: siteSettings.instagramTokenExpiresAt,
      refreshedAt: siteSettings.instagramTokenRefreshedAt,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  return {
    hasToken: Boolean(row?.hasToken) || Boolean(process.env.META_ACCESS_TOKEN),
    fromEnv: Boolean(process.env.META_ACCESS_TOKEN?.trim()),
    expiresAt: row?.expiresAt ?? null,
    refreshedAt: row?.refreshedAt ?? null,
  };
}
