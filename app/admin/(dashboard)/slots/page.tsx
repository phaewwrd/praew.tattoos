import { PageHeader } from "@/components/admin/ui";
import { addDays, startOfWeek, toBangkokDate } from "@/lib/time";
import { dateSchema } from "@/lib/validation/common";
import { listSlotsInRange } from "@/server/slots";
import { SlotsManager } from "./slots-manager";

export const metadata = { title: "Slots" };

export default async function SlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const parsed = dateSchema.safeParse(week);
  const weekStart = startOfWeek(parsed.success ? parsed.data : toBangkokDate());
  const slots = await listSlotsInRange(weekStart, addDays(weekStart, 6));

  return (
    <>
      <PageHeader
        title="Slots"
        description="One-hour slots, one booking each. Customers can only book slots you open here."
      />
      <SlotsManager
        weekStart={weekStart}
        today={toBangkokDate()}
        slots={slots}
      />
    </>
  );
}
