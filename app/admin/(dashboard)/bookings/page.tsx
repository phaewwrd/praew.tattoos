import { PageHeader } from "@/components/admin/ui";
import { toBangkokDate } from "@/lib/time";
import { listBookings } from "@/server/bookings";
import { listServiceOptions } from "@/server/services";
import { BookingsManager } from "./bookings-manager";

export const metadata = { title: "Bookings" };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const [bookings, services] = await Promise.all([
    listBookings(),
    listServiceOptions(),
  ]);
  return (
    <>
      <PageHeader
        title="Bookings"
        description="Pending and Confirmed hold the slot; Cancelled releases it."
      />
      <BookingsManager
        bookings={bookings}
        services={services}
        today={toBangkokDate()}
        initialQuery={q ?? ""}
        initialStatus={status ?? "all"}
      />
    </>
  );
}
