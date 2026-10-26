"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { instagramUrl, telUrl, whatsappUrl } from "@/lib/contact-links";
import type { PublicSettings } from "@/server/settings";
import { Modal } from "./Modal";

const navLink =
  "py-1 font-semibold text-brand text-base uppercase underline-offset-4 hover:underline sm:text-lg lg:text-xl";

export function SiteHeader({
  settings,
  home = true,
}: {
  settings: PublicSettings;
  home?: boolean;
}) {
  const [open, setOpen] = useState<"location" | "contact" | null>(null);
  const close = () => setOpen(null);

  return (
    <header
      className={
        home
          ? "relative z-30 px-4 pt-5 sm:px-8 lg:absolute lg:top-0 lg:right-0 lg:px-10 lg:pt-6"
          : "relative px-4 pt-6 pb-2 sm:px-8"
      }
    >
      {home ? null : (
        <Link href="/" className="mx-auto mb-4 block w-full max-w-md">
          <Image
            src="/wordmark.png"
            alt={settings.studioName}
            width={1160}
            height={250}
            preload
            className="h-auto w-full"
          />
        </Link>
      )}
      <nav aria-label="Main">
        <ul
          className={`flex flex-wrap items-center gap-x-5 gap-y-1 sm:gap-x-8 ${home ? "justify-center lg:justify-end" : "justify-center"}`}
        >
          {home ? null : (
            <li>
              <Link className={navLink} href="/#services">
                Services.
              </Link>
            </li>
          )}
          <li>
            <button
              type="button"
              className={navLink}
              onClick={() => setOpen("location")}
            >
              Location.
            </button>
          </li>
          <li>
            <button
              type="button"
              className={navLink}
              onClick={() => setOpen("contact")}
            >
              Contact us.
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
