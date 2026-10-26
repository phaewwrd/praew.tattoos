import type { PublicSettings } from "@/server/settings";

export function SiteFooter({ settings }: { settings: PublicSettings }) {
  return (
    <footer className="mt-auto border-ink/15 border-t px-4 py-6 text-center text-ink/70 text-sm sm:px-8">
      <p className="font-bold font-stitch text-brand">{settings.studioName}</p>
      <p className="mt-1">
        {settings.city} · {settings.openingHours}
      </p>
    </footer>
  );
}
