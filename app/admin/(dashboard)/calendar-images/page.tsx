import { PageHeader } from "@/components/admin/ui";
import { listMonthImages } from "@/server/content";
import { getPublicSettings } from "@/server/settings";
import { CalendarImagesManager } from "./calendar-images-manager";

export const metadata = { title: "Calendar images" };

export default async function CalendarImagesPage() {
  const [images, settings] = await Promise.all([
    listMonthImages(),
    getPublicSettings(),
  ]);
  return (
    <>
      <PageHeader
        title="Calendar images"
        description="A hand-painted image per month (used every year) and the heart drawn over the selected day."
      />
      <CalendarImagesManager
        images={images.map(({ month, url }) => ({ month, url }))}
        heartImageUrl={settings.heartImageUrl}
      />
    </>
  );
}
