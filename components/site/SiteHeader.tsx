"use client";

import Link from "next/link";
import { useState } from "react";
import { instagramUrl, telUrl, whatsappUrl } from "@/lib/contact-links";
import type { PublicSettings } from "@/server/settings";
import { Modal } from "./Modal";

const navLink =
  "px-2 py-1 font-black text-brand text-sm uppercase tracking-[0.12em] underline-offset-4 hover:underline sm:text-base";

export function SiteHeader({
  settings,
  home = true,
}: {
  settings: PublicSettings;
  home?: boolean;
}) {
  const [open, setOpen] = useState<"location" | "contact" | null>(null);
  const close = () => setOpen(null);
  const anchor = (id: string) => (home ? `#${id}` : `/#${id}`);

  return (
    <header className="relative px-12 pt-6 pb-4 sm:px-24">
      {/* Corner letters: cross-stitch artwork placeholders. */}
      <span
        aria-hidden="true"
        className="absolute top-3 left-3 select-none font-bold font-stitch text-5xl text-brand/80 sm:text-7xl"
      >
        P
      </span>
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 select-none font-bold font-stitch text-5xl text-brand/80 sm:text-7xl"
      >
        T
      </span>

      <Link href="/" className="mx-auto block w-fit">
        {/* Logo placeholder until the cross-stitch lettering image is supplied. */}
        <span className="block text-center font-bold font-stitch text-2xl text-brand tracking-wide sm:text-5xl">
          {settings.studioName}
        </span>
      </Link>

      <nav aria-label="Main" className="mt-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-6">
          <li>
            <a className={navLink} href={anchor("services")}>
              Services
            </a>
          </li>
          <li>
            <a className={navLink} href={anchor("instagram")}>
              Instagram
            </a>
          </li>
          <li>
            <button
              type="button"
              className={navLink}
              onClick={() => setOpen("location")}
            >
              Location
            </button>
          </li>
          <li>
            <button
              type="button"
              className={navLink}
              onClick={() => setOpen("contact")}
            >
              Contact us
            </button>
          </li>
          <li>
            <Link className={navLink} href="/faq">
              Question
            </Link>
          </li>
        </ul>
      </nav>

      <Modal open={open === "location"} onClose={close} title="Location">
        <div className="grid gap-3 text-base">
          <p className="font-bold text-lg">{settings.city}</p>
          <p>{settings.mrtInfo}</p>
          <p className="font-hand text-2xl text-brand">
            {settings.locationNote}
          </p>
          <p className="text-ink/70 text-sm">{settings.openingHours}</p>
          <a
            href={settings.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block w-fit border-2 border-ink bg-brand px-5 py-2.5 font-black text-cream uppercase tracking-wider shadow-[4px_4px_0_var(--color-ink)] hover:bg-brand-dark"
          >
            Open map ↗
          </a>
        </div>
      </Modal>

      <Modal open={open === "contact"} onClose={close} title="Contact us">
        <ul className="grid gap-3 text-base">
          <li>
            <span className="block font-hand text-ink/70 text-xl">Phone</span>
            <a className="font-bold underline" href={telUrl(settings.phone)}>
              {settings.phone}
            </a>
          </li>
          <li>
            <span className="block font-hand text-ink/70 text-xl">
              WhatsApp
            </span>
            <a
              className="font-bold underline"
              href={whatsappUrl(settings.whatsapp)}
              target="_blank"
              rel="noreferrer"
            >
              {settings.whatsapp} ↗
            </a>
          </li>
          <li>
            <span className="block font-hand text-ink/70 text-xl">Email</span>
            <a
              className="font-bold underline"
              href={`mailto:${settings.email}`}
            >
              {settings.email}
            </a>
          </li>
          <li>
            <span className="block font-hand text-ink/70 text-xl">
              Instagram
            </span>
            <a
              className="font-bold underline"
              href={instagramUrl(settings.instagramHandle)}
              target="_blank"
              rel="noreferrer"
            >
              @{settings.instagramHandle} ↗
            </a>
          </li>
        </ul>
      </Modal>
    </header>
  );
}
