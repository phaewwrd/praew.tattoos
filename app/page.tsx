import { BookingSection } from "@/components/site/BookingSection";
import { InstagramStrip } from "@/components/site/InstagramStrip";
import { ServiceStage } from "@/components/site/ServiceStage";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { toBangkokDate } from "@/lib/time";
import { listMonthImages } from "@/server/content";
import { getInstagramFeed } from "@/server/instagram";
import { listServices } from "@/server/services";
import { getPublicSettings } from "@/server/settings";
import { listPublicSlots } from "@/server/slots";

// Availability must always be current.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, services, slots, monthImages, feed] = await Promise.all([
    getPublicSettings(),
    listServices(),
    listPublicSlots(),
    listMonthImages(),
    getInstagramFeed(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-cream">
      <main className="relative mx-auto w-full max-w-[100rem]">
        <SiteHeader settings={settings} />
        <ServiceStage
          services={services}
          instagram={
            <InstagramStrip feed={feed} handle={settings.instagramHandle} />
          }
        />
        <BookingSection
          initialSlots={slots}
          today={toBangkokDate()}
          monthImages={Object.fromEntries(
            monthImages.map((m) => [m.month, m.url]),
          )}
          heartImageUrl={settings.heartImageUrl}
        />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
