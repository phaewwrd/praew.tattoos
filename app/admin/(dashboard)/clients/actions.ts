"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/tattoo-schema";
import { requireAdminSession } from "@/lib/admin-auth";
import type { MutationResult } from "@/types/actions";

type ClientInput = {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
};

function validateClient(input: ClientInput): string | null {
  if (!input || typeof input !== "object") return "Enter valid client details.";
  if (
    typeof input.fullName !== "string" ||
    !input.fullName.trim() ||
    input.fullName.trim().length > 100
  )
    return "Name is required (maximum 100 characters).";
  if (
    typeof input.email !== "string" ||
    input.email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  )
    return "Enter a valid email address.";
  if (
    typeof input.phone !== "string" ||
    !input.phone.trim() ||
    input.phone.trim().length > 20
  )
    return "Phone is required (maximum 20 characters).";
  return null;
}

function revalidateClients(id?: number) {
  revalidatePath("/admin/clients");
  revalidatePath("/admin/bookings");
  if (id) revalidatePath(`/admin/clients/${id}`);
}

export async function saveClient(input: ClientInput): Promise<MutationResult> {
  await requireAdminSession();
  const invalid = validateClient(input);
  if (invalid) return { ok: false, error: invalid };
  const values = {
    name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
  };
  try {
    if (input.id !== undefined) {
      if (!Number.isSafeInteger(input.id) || input.id < 1)
        return { ok: false, error: "Choose a valid client." };
      const updated = await db
        .update(clients)
        .set(values)
        .where(eq(clients.id, input.id))
        .returning({ id: clients.id });
      if (!updated.length) return { ok: false, error: "Client not found." };
      revalidateClients(input.id);
    } else {
      await db.insert(clients).values(values);
      revalidateClients();
    }
  } catch {
    return { ok: false, error: "Unable to save this client. Try again." };
  }
  return { ok: true };
}

export async function setClientArchived(
  id: number,
  isArchived: boolean,
): Promise<MutationResult> {
  await requireAdminSession();
  if (!Number.isSafeInteger(id) || id < 1 || typeof isArchived !== "boolean")
    return { ok: false, error: "Choose a valid client status." };
  try {
    const updated = await db
      .update(clients)
      .set({ isArchived })
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    if (!updated.length) return { ok: false, error: "Client not found." };
  } catch {
    return { ok: false, error: "Unable to update this client. Try again." };
  }
  revalidateClients(id);
  return { ok: true };
}
