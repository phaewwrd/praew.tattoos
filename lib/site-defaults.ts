import type { siteSettings } from "@/db/schema";

export const DEFAULT_SITE_SETTINGS = {
  studioName: "Praew.Tattoos",
  city: "Bangkok, Thailand",
  locationNote: "Full studio details are shared with confirmed appointments.",
  mrtInfo:
    "Nearest MRT: Bangson (Purple line and Red line), exit 5, about 10 minutes' walk",
  mapUrl: "https://share.google/k5y0rPDuMLHB0XbsD",
  openingHours: "Tue–Sun 11:00–18:00, closed Monday",
  instagramHandle: "Praew.tattoos",
  phone: "062-145-6941",
  whatsapp: "062-145-6941",
  email: "praew.tattoos@gmail.com",
} satisfies Partial<typeof siteSettings.$inferInsert>;
