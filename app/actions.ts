"use server";

import { createAction } from "@/lib/action";
import { ActionError } from "@/lib/server-response";
import { bookingRequestSchema } from "@/lib/validation/booking";
import { createBooking } from "@/server/bookings";
import { hitRateLimit } from "@/server/rate-limit";

/** Public booking request: creates a Pending booking and locks the slot immediately. */
export const requestBookingAction = createAction(
  bookingRequestSchema,
  async ({ website, slotId, ...contact }) => {
    // Honeypot filled in: pretend success so bots learn nothing.
    if (website) return { id: "ok" };

    const allowed = await hitRateLimit("booking", {
      limit: 5,
      windowSeconds: 600,
    });
    if (!allowed) {
      throw new ActionError(
        "RATE_LIMITED",
        "Too many requests. Please try again in a few minutes.",
      );
    }

    const booking = await createBooking({
      slotId,
      contact,
      status: "pending",
      source: "website",
    });
    return { id: booking.id };
  },
  { public: true, revalidate: ["/admin", "/admin/bookings", "/admin/slots"] },
);
