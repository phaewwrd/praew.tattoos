"use server";

import { createAction } from "@/lib/action";
import {
  adminBookingSchema,
  updateBookingSchema,
} from "@/lib/validation/booking";
import { createAdminBooking, updateBooking } from "@/server/bookings";

const revalidate = [
  "/",
  "/admin",
  "/admin/bookings",
  "/admin/slots",
  "/admin/customers",
];

export const createAdminBookingAction = createAction(
  adminBookingSchema,
  async ({
    firstName,
    lastName,
    email,
    phone,
    date,
    time,
    serviceId,
    adminNote,
    status,
  }) =>
    createAdminBooking({
      date,
      time,
      status,
      serviceId,
      adminNote,
      contact: { firstName, lastName, email, phone },
    }),
  { revalidate },
);

export const updateBookingAction = createAction(
  updateBookingSchema,
  async (input) => updateBooking(input),
  { revalidate },
);
