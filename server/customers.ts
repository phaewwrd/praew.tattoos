import "server-only";

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Tx } from "@/db";
import { db } from "@/db";
import {
  bookings,
  customerNotes,
  customers,
  customerTagLinks,
  customerTags,
} from "@/db/schema";

type ContactInput = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

/**
 * Finds a customer matching the email or phone (most recently updated wins) and
 * fills in any missing contact details, or creates a new customer.
 */
export async function findOrCreateCustomer(
  tx: Tx,
  input: ContactInput,
): Promise<string> {
  const matchers = [
    input.email ? eq(customers.email, input.email) : undefined,
    input.phone ? eq(customers.phone, input.phone) : undefined,
  ].filter(Boolean);

  if (matchers.length > 0) {
    const [existing] = await tx
      .select()
      .from(customers)
      .where(or(...matchers))
      .orderBy(desc(customers.updatedAt))
      .limit(1)
      .for("update");
    if (existing) {
      await tx
        .update(customers)
        .set({
          email: existing.email ?? input.email,
          phone: existing.phone ?? input.phone,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, existing.id));
      return existing.id;
    }
  }

  const [created] = await tx
    .insert(customers)
    .values(input)
    .returning({ id: customers.id });
  return created.id;
}

// Drizzle omits the table name in single-table selects; subqueries need it explicitly.
const customerRef = sql.raw('"customers"."id"');

export type CustomerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  bookingCount: number;
  lastBookingDate: string | null;
  tags: string[];
};

export async function searchCustomers(
  query: string,
): Promise<CustomerListItem[]> {
  const q = query.trim();
  const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const digits = q.replace(/[^\d+]/g, "");
  const where = q
    ? or(
        ilike(
          sql`${customers.firstName} || ' ' || ${customers.lastName}`,
          pattern,
        ),
        ilike(customers.email, pattern),
        digits.length >= 3 ? ilike(customers.phone, `%${digits}%`) : undefined,
      )
    : undefined;

  return db
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.email,
      phone: customers.phone,
      bookingCount: sql<number>`(select count(*)::int from bookings b where b.customer_id = ${customerRef})`,
      lastBookingDate: sql<string | null>`(
        select max(s.date)::text from bookings b join slots s on s.id = b.slot_id
        where b.customer_id = ${customerRef}
      )`,
      tags: sql<string[]>`coalesce((
        select array_agg(t.name order by t.name) from customer_tag_links l
        join customer_tags t on t.id = l.tag_id where l.customer_id = ${customerRef}
      ), '{}')`,
    })
    .from(customers)
    .where(where)
    .orderBy(asc(customers.lastName), asc(customers.firstName))
    .limit(500);
}

export async function getCustomer(id: string) {
  return db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      notes: { orderBy: [desc(customerNotes.createdAt)] },
      tagLinks: { with: { tag: true } },
      bookings: {
        orderBy: [desc(bookings.createdAt)],
        with: {
          slot: { columns: { date: true, startTime: true } },
          service: { columns: { name: true } },
        },
      },
    },
  });
}

export async function listAllTags() {
  return db.select().from(customerTags).orderBy(asc(customerTags.name));
}

export async function addTag(customerId: string, name: string) {
  await db.transaction(async (tx) => {
    let [tag] = await tx
      .select()
      .from(customerTags)
      .where(sql`lower(${customerTags.name}) = lower(${name})`);
    if (!tag) {
      [tag] = await tx.insert(customerTags).values({ name }).returning();
    }
    await tx
      .insert(customerTagLinks)
      .values({ customerId, tagId: tag.id })
      .onConflictDoNothing();
  });
}

export async function removeTag(customerId: string, tagId: string) {
  await db
    .delete(customerTagLinks)
    .where(
      and(
        eq(customerTagLinks.customerId, customerId),
        eq(customerTagLinks.tagId, tagId),
      ),
    );
  // Drop tags nobody uses any more.
  await db
    .delete(customerTags)
    .where(
      and(
        eq(customerTags.id, tagId),
        sql`not exists (select 1 from ${customerTagLinks} where ${customerTagLinks.tagId} = ${tagId})`,
      ),
    );
}
