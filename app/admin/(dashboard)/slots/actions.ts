"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { slots } from "@/db/schema";
import { createAction } from "@/lib/action";
import {
  copyWeekSchema,
  setDaySlotsSchema,
  slotIdsSchema,
  toggleSlotSchema,
} from "@/lib/validation/admin";
import { copyPreviousWeek, removeSlots, setDaySlots } from "@/server/slots";

const revalidate = ["/", "/admin/slots"];

export const setDaySlotsAction = createAction(
  setDaySlotsSchema,
  async ({ dates, times, mode }) =>
    setDaySlots(dates, [...new Set(times)], mode),
  { revalidate },
);

export const copyPreviousWeekAction = createAction(
  copyWeekSchema,
  async ({ weekStart }) => copyPreviousWeek(weekStart),
  { revalidate },
);

export const removeSlotsAction = createAction(
  slotIdsSchema,
  async ({ ids }) => removeSlots(ids),
  { revalidate },
);

export const toggleSlotAction = createAction(
  toggleSlotSchema,
  async ({ id, isOpen }) => {
    await db.update(slots).set({ isOpen }).where(eq(slots.id, id));
  },
  { revalidate },
);
