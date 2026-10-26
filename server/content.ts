import "server-only";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import { faqs, instagramFallbackImages, monthImages } from "@/db/schema";

export function listFaqs() {
  return db
    .select()
    .from(faqs)
    .orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));
}

export function listMonthImages() {
  return db.select().from(monthImages).orderBy(asc(monthImages.month));
}

export function listFallbackImages() {
  return db
    .select()
    .from(instagramFallbackImages)
    .orderBy(
      asc(instagramFallbackImages.sortOrder),
      asc(instagramFallbackImages.createdAt),
    );
}
