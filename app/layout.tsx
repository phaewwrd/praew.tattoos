import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const description =
  "Minimal, realistic and color realistic tattoos by Praew in Bangkok, Thailand. Pick a free time and request your appointment online.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Praew.Tattoos | Tattoo studio in Bangkok",
    template: "%s | Praew.Tattoos",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Praew.Tattoos",
    title: "Praew.Tattoos | Tattoo studio in Bangkok",
    description,
    locale: "en_US",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Praew.Tattoos", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3e8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans font-thin">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
