"use server";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { createAction } from "@/lib/action";
import {
  faqSchema,
  reorderSchema,
  updateFaqSchema,
} from "@/lib/validation/admin";
import { uuidSchema } from "@/lib/validation/common";

const revalidate = ["/faq", "/admin/faq"];

export const createFaqAction = createAction(
  faqSchema,
  async (input) => {
    const [{ next }] = await db
      .select({
        next: sql<number>`coalesce(max(${faqs.sortOrder}) + 1, 0)::int`,
      })
      .from(faqs);
    await db.insert(faqs).values({ ...input, sortOrder: next });
  },
  { revalidate },
);

export const updateFaqAction = createAction(
  updateFaqSchema,
  async ({ id, ...values }) => {
    await db.update(faqs).set(values).where(eq(faqs.id, id));
  },
  { revalidate },
);

export const deleteFaqAction = createAction(
  z.object({ id: uuidSchema }),
  async ({ id }) => {
    await db.delete(faqs).where(eq(faqs.id, id));
  },
  { revalidate },
);

export const reorderFaqsAction = createAction(
  reorderSchema,
  async ({ ids }) => {
    await db.transaction(async (tx) => {
      for (const [index, id] of ids.entries()) {
        await tx.update(faqs).set({ sortOrder: index }).where(eq(faqs.id, id));
      }
    });
  },
  { revalidate },
);
