"use client";

import Image from "next/image";
import { useState } from "react";
import { startAt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceWithImages } from "@/server/services";
import { Turntable } from "./illustrations";

const CARD_TONES = ["bg-butter", "bg-sky"];
const CARD_TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"];
const PHOTOS_PER_PAGE = 6;

export function ServiceStage({ services }: { services: ServiceWithImages[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const count = services.length;
  const current = services[index];

  if (count === 0) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      id="services"
      aria-label="Services"
      className="grid scroll-mt-6 items-center gap-10 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.05fr)_minmax(0,1.25fr)] lg:gap-8"
    >
      {/* Left: tilted polaroid cards */}
      <ul className="flex snap-x gap-5 overflow-x-auto px-1 pt-2 pb-6 lg:flex-col lg:items-center lg:gap-0 lg:overflow-visible lg:p-0">
        {services.map((service, i) => {
          const cover = service.images[0];
          return (
            <li
              key={service.id}
              className={cn(
                "w-52 shrink-0 snap-center transition-transform lg:mb-3 lg:w-48 lg:even:translate-x-8 lg:odd:-translate-x-8",
                CARD_TILTS[i % CARD_TILTS.length],
              )}
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                aria-label={`${service.name}, ${startAt(service.priceThb)}`}
                className={cn(
                  "block w-full border border-ink/15 p-3 pb-4 text-left shadow-[0_10px_20px_-8px_rgb(42_26_23/45%)] transition-transform hover:-translate-y-1 hover:rotate-0",
                  CARD_TONES[i % CARD_TONES.length],
                  i === index && "ring-4 ring-brand/70",
                )}
              >
                <span className="relative block aspect-square overflow-hidden bg-mauve">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt || service.name}
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <span className="mt-3 block font-black text-brand text-lg uppercase leading-tight">
                  {service.name}
                </span>
                <span className="mt-1 block font-bold text-ink/80 text-xs tracking-widest">
                  {startAt(service.priceThb)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Center: record-player carousel */}
      <div className="mx-auto w-full max-w-sm rotate-1 border-2 border-ink bg-paper p-5 shadow-[10px_10px_0_var(--color-ink)]">
        <Turntable playing={playing} className="w-full" />
        <div className="mt-4" aria-live="polite">
          <h2 className="font-black text-2xl text-brand uppercase leading-tight">
            {current.name}
          </h2>
          <p className="mt-1 font-bold text-ink/70 text-sm tracking-widest">
            {startAt(current.priceThb)}
          </p>
        </div>
        <div className="mt-4">
          <p className="sr-only">
            Service {index + 1} of {count}
          </p>
          <div
            aria-hidden="true"
            className="h-1.5 w-full rounded-full bg-ink/15"
          >
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300"
              style={{ width: `${((index + 1) / count) * 100}%` }}
            />
          </div>
          <div
            className="mt-1 flex justify-between font-bold text-ink/60 text-xs"
            aria-hidden="true"
          >
            <span>{index + 1}</span>
            <span>{count}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous service"
            className="grid size-12 place-items-center rounded-full text-ink hover:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            aria-pressed={playing}
            aria-label={playing ? "Pause turntable" : "Play turntable"}
            className="grid size-16 place-items-center rounded-full bg-brand text-cream shadow-[3px_3px_0_var(--color-ink)] hover:bg-brand-dark"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="ml-1 size-8"
                aria-hidden="true"
              >
                <path d="M7 4v16l13-8z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next service"
            className="grid size-12 place-items-center rounded-full text-ink hover:bg-ink/10"
          >
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right: vinyl carrying the selected service's photos */}
      <VinylPhotos key={current.id} service={current} playing={playing} />
    </section>
  );
}

function VinylPhotos({
  service,
  playing,
}: {
  service: ServiceWithImages;
  playing: boolean;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(service.images.length / PHOTOS_PER_PAGE));
  const photos = service.images.slice(
    page * PHOTOS_PER_PAGE,
    (page + 1) * PHOTOS_PER_PAGE,
  );
  const slots = photos.length > 0 ? photos.length : 4;
  const radius = slots === 1 ? 0 : 31;
  const size = slots === 1 ? 44 : slots <= 3 ? 30 : 24;

  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <div className="drop-in relative aspect-square">
        <div
          className={cn(
            "vinyl-grooves spin-very-slow absolute inset-0 rounded-full shadow-[0_20px_40px_-12px_rgb(0_0_0/60%)]",
            !playing && "paused",
          )}
        >
          <div className="absolute inset-[42%] rounded-full bg-brand ring-4 ring-vinyl" />
          {Array.from({ length: slots }, (_, i) => {
            const photo = photos[i];
            const angle = (360 / slots) * i - 90;
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={photo?.id ?? `placeholder-${i}`}
                className="absolute overflow-hidden border-4 border-paper bg-mauve shadow-md"
                style={{
                  width: `${size}%`,
                  height: `${size}%`,
                  left: `${x - size / 2}%`,
                  top: `${y - size / 2}%`,
                  transform: `rotate(${angle + 90}deg)`,
                }}
              >
                {photo ? (
                  <Image
                    src={photo.url}
                    alt={
                      photo.alt ||
                      `${service.name} tattoo ${page * PHOTOS_PER_PAGE + i + 1}`
                    }
                    fill
                    sizes="(min-width: 1024px) 160px, 30vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3 font-bold text-sm">
          <button
            type="button"
            className="grid size-10 place-items-center border-2 border-ink bg-paper disabled:opacity-40"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous photos"
          >
            ‹
          </button>
          <span>
            Photos {page + 1} / {pages}
          </span>
          <button
            type="button"
            className="grid size-10 place-items-center border-2 border-ink bg-paper disabled:opacity-40"
            onClick={() => setPage(page + 1)}
            disabled={page === pages - 1}
            aria-label="More photos"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
