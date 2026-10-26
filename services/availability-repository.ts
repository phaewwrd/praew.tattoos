import { and, asc, eq, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  clients,
  scheduleDateBlocks,
  slots,
  tattooArtists,
  tattooServices,
} from "@/db/tattoo-schema";

export const availabilityRepository = {
  async getScheduledDates(today: string) {
    const rows = await db
      .selectDistinct({ date: slots.date })
      .from(slots)
      .leftJoin(
        appointments,
        and(
          eq(appointments.slotId, slots.id),
          ne(appointments.status, "CANCELLED"),
        ),
      )
      .where(
        and(
          eq(slots.status, "AVAILABLE"),
          gte(slots.date, today),
          sql`${appointments.id} is null`,
          sql`not exists (
            select 1 from ${scheduleDateBlocks}
            where ${scheduleDateBlocks.artistId} = ${slots.artistId}
              and ${scheduleDateBlocks.date} = ${slots.date}
          )`,
        ),
      )
      .orderBy(asc(slots.date));

    return rows.map((row) => row.date);
  },

  async getScheduledTimes(date: string) {
    const rows = await db
      .select({ time: slots.startTime })
      .from(slots)
      .leftJoin(
        appointments,
        and(
          eq(appointments.slotId, slots.id),
          ne(appointments.status, "CANCELLED"),
        ),
      )
      .where(
        and(
          eq(slots.date, date),
          eq(slots.status, "AVAILABLE"),
          sql`${appointments.id} is null`,
          sql`not exists (
            select 1 from ${scheduleDateBlocks}
            where ${scheduleDateBlocks.artistId} = ${slots.artistId}
              and ${scheduleDateBlocks.date} = ${slots.date}
          )`,
        ),
      )
      .orderBy(asc(slots.startTime));

    return rows.map((row) => row.time.slice(0, 5));
  },

  async reserve(input: {
    date: string;
    time: string;
    fullName: string;
    email: string;
    serviceId: string;
    details: string;
  }) {
    return db.transaction(async (tx) => {
      const [service] = await tx
        .select({
          id: tattooServices.id,
          priceFrom: tattooServices.priceFrom,
          depositAmount: tattooServices.depositAmount,
        })
        .from(tattooServices)
        .where(
          and(
            eq(tattooServices.id, input.serviceId),
            eq(tattooServices.isActive, true),
          ),
        )
        .limit(1);
      if (!service) return { ok: false as const, reason: "invalid" as const };

      const candidate = await tx
        .select({ artistId: slots.artistId })
        .from(slots)
        .where(
          and(
            eq(slots.date, input.date),
            eq(slots.startTime, `${input.time}:00`),
            eq(slots.status, "AVAILABLE"),
          ),
        )
        .limit(1);

      if (!candidate[0]) {
        return { ok: false as const, reason: "unavailable" as const };
      }

      const [artist] = await tx
        .select({ id: tattooArtists.id })
        .from(tattooArtists)
        .where(eq(tattooArtists.id, candidate[0].artistId))
        .for("update");
      if (!artist)
        return { ok: false as const, reason: "unavailable" as const };

      const matchedSlot = await tx
        .select({ id: slots.id, artistId: slots.artistId })
        .from(slots)
        .where(
          and(
            eq(slots.artistId, candidate[0].artistId),
            eq(slots.date, input.date),
            eq(slots.startTime, `${input.time}:00`),
            eq(slots.status, "AVAILABLE"),
          ),
        )
        .limit(1)
        .for("update");
      if (!matchedSlot[0])
        return { ok: false as const, reason: "unavailable" as const };

      const [dateBlock] = await tx
        .select({ date: scheduleDateBlocks.date })
        .from(scheduleDateBlocks)
        .where(
          and(
            eq(scheduleDateBlocks.artistId, matchedSlot[0].artistId),
            eq(scheduleDateBlocks.date, input.date),
          ),
        )
        .limit(1);
      const [existingAppointment] = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.slotId, matchedSlot[0].id),
            ne(appointments.status, "CANCELLED"),
          ),
        )
        .limit(1);

      if (dateBlock || existingAppointment) {
        return { ok: false as const, reason: "unavailable" as const };
      }

      const insertedClient = await tx
        .insert(clients)
        .values({
          name: input.fullName,
          email: input.email,
          phone: "-",
        })
        .returning({ id: clients.id });

      await tx.insert(appointments).values({
        clientId: insertedClient[0].id,
        slotId: matchedSlot[0].id,
        details: input.details,
        status: "PENDING_PAYMENT",
        agreedPrice: service.priceFrom,
        depositAmount: service.depositAmount,
      });
      await tx
        .update(slots)
        .set({ status: "BOOKED" })
        .where(eq(slots.id, matchedSlot[0].id));

      return { ok: true as const };
    });
  },
};
