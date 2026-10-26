"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customerNotes, customers } from "@/db/schema";
import { createAction } from "@/lib/action";
import {
  customerNoteSchema,
  customerSchema,
  customerTagSchema,
  removeTagSchema,
  updateCustomerSchema,
} from "@/lib/validation/admin";
import { uuidSchema } from "@/lib/validation/common";
import { addTag, removeTag } from "@/server/customers";

const revalidate = ["/admin/customers", "/admin/bookings"];

export const createCustomerAction = createAction(
  customerSchema,
  async (input) => {
    const [created] = await db
      .insert(customers)
      .values(input)
      .returning({ id: customers.id });
    return created.id;
  },
  { revalidate },
);

export const updateCustomerAction = createAction(
  updateCustomerSchema,
  async ({ id, ...values }) => {
    await db.update(customers).set(values).where(eq(customers.id, id));
  },
  { revalidate },
);

export const deleteCustomerAction = createAction(
  z.object({ id: uuidSchema }),
  async ({ id }) => {
    // Bookings cascade, which also releases their slots.
    await db.delete(customers).where(eq(customers.id, id));
  },
  { revalidate: [...revalidate, "/", "/admin", "/admin/slots"] },
);

export const addCustomerNoteAction = createAction(
  customerNoteSchema,
  async (input) => {
    await db.insert(customerNotes).values(input);
  },
  { revalidate },
);

export const deleteCustomerNoteAction = createAction(
  z.object({ id: uuidSchema, customerId: uuidSchema }),
  async ({ id, customerId }) => {
    await db
      .delete(customerNotes)
      .where(
        and(eq(customerNotes.id, id), eq(customerNotes.customerId, customerId)),
      );
  },
  { revalidate },
);

export const addCustomerTagAction = createAction(
  customerTagSchema,
  async ({ customerId, name }) => addTag(customerId, name),
  { revalidate },
);

export const removeCustomerTagAction = createAction(
  removeTagSchema,
  async ({ customerId, tagId }) => removeTag(customerId, tagId),
  { revalidate },
);
