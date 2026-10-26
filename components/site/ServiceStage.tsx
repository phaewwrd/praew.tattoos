"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { startAt } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceWithImages } from "@/server/services";

const CARD_TONES = ["bg-butter", "bg-sky", "bg-teal"];
const CARD_TILTS = ["rotate-3", "-rotate-6", "rotate-12", "-rotate-3"];
const PHOTOS_PER_PAGE = 3;
// Where each photo sits over the record on wide screens (as in the collage).
const PHOTO_SPOTS = [
  "lg:top-[3%] lg:left-0",
  "lg:top-[38%] lg:-left-[1%]",
  "lg:top-[72%] lg:left-[17%]",
];

export function ServiceStage({
  services,
  instagram,
}: {
  services: ServiceWithImages[];
  instagram: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const count = services.length;
  const current = services[index];

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const shuffle = () => {
    if (count < 2) return;
    const next = Math.floor(Math.random() * (count - 1));
    setIndex(next >= index ? next + 1 : next);
  };

  return (
    <section
      id="services"
      aria-label="Services"
      className="relative scroll-mt-6 px-4 pt-6 sm:px-8 lg:grid lg:min-h-[54rem] lg:grid-cols-[16rem_minmax(0,1fr)_30%] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:px-10 lg:pt-8"
    >
      {/* Cross-stitch corner letters */}
      <Image
        src="/stitch-p.png"
        alt=""
        width={160}
        height={145}
        className="pointer-events-none absolute top-10 left-[16%] hidden w-[7%] lg:block"
      />
      <Image
        src="/stitch-t.png"
        alt=""
        width={175}
        height={140}
        className="pointer-events-none absolute top-16 left-[74%] z-20 hidden w-[7%] lg:block"
      />

      {/* Wordmark: logo on top for small screens, behind the player on wide ones. */}
      <h1 className="mx-auto mb-6 w-full max-w-xl lg:pointer-events-none lg:absolute lg:top-[19rem] lg:left-[19%] lg:z-0 lg:mb-0 lg:w-[56%] lg:max-w-none">
        <Image
          src="/wordmark.png"
          alt="Praew.Tattoos"
          width={1160}
          height={250}
          preload
          className="h-auto w-full"
        />
      </h1>

      {/* Left: stacked service cards */}
      <div className="lg:relative lg:z-10 lg:row-span-2">
        <h2 className="mb-4 font-semibold text-2xl text-brand uppercase">
          Services
        </h2>
        {count === 0 ? (
          <p className="font-hand text-2xl text-ink/70">
            Services coming soon.
          </p>
        ) : (
          <ul className="flex snap-x gap-5 overflow-x-auto px-2 pt-2 pb-8 lg:block lg:overflow-visible lg:p-0">
            {services.map((service, i) => {
              const cover = service.images[0];
              return (
                <li
                  key={service.id}
                  className={cn(
                    "relative w-56 shrink-0 snap-center lg:not-first:-mt-8 lg:w-52 lg:even:ml-3",
                    CARD_TILTS[i % CARD_TILTS.length],
                    i === index ? "z-10" : "z-0",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-pressed={i === index}
                    aria-label={`${service.name}, ${startAt(service.priceThb)}`}
                    className={cn(
                      "block w-full px-6 pt-6 pb-4 text-left shadow-[0_12px_24px_-10px_rgb(42_26_23/45%)] transition-transform hover:-translate-y-1",
                      CARD_TONES[i % CARD_TONES.length],
                      i === index &&
                        "-translate-y-1 shadow-[0_18px_30px_-10px_rgb(42_26_23/55%)]",
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
                    <span className="mt-4 block font-semibold text-2xl text-brand uppercase leading-none">
                      {service.name}
                    </span>
                    <span className="mt-1 block font-semibold text-brand text-xs uppercase">
                      {startAt(service.priceThb)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Center top: Instagram row */}
      <div className="relative z-10 lg:col-start-2 lg:row-start-1 lg:pt-6">
        {instagram}
      </div>

      {/* Center: record-player card */}
      {current ? (
        <div className="relative z-10 mx-auto mt-6 w-full max-w-80 bg-linen p-6 lg:col-start-2 lg:row-start-2 lg:mt-14 lg:self-start">
          <Image
            src="/turntable.png"
            alt="Red record player"
            width={590}
            height={450}
            className="h-auto w-full shadow-sm"
          />
          <div className="mt-5" aria-live="polite">
            <p className="font-semibold text-2xl text-brand uppercase leading-none">
              {current.name}
            </p>
            <p className="mt-1.5 font-semibold text-brand text-xs uppercase">
              {startAt(current.priceThb)}
            </p>
          </div>
          <p className="sr-only">
            Service {index + 1} of {count}
          </p>
          <div
            aria-hidden="true"
            className="relative mx-4 mt-5 h-0.5 bg-ink/25"
          >
            <div
              className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-300"
              style={{ width: `${((index + 1) / count) * 100}%` }}
            />
            <div
              className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-[left] duration-300"
              style={{ left: `${((index + 1) / count) * 100}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between px-1 text-ink">
            <PlayerButton label="Random service" onClick={shuffle}>
              <path
                d="M3 7h3.5c2 0 3 1 4.3 3l2.4 4c1.3 2 2.3 3 4.3 3H20M17 4l3 3-3 3M3 17h3.5c1.4 0 2.3-.5 3.2-1.5M13.3 8.5c.9-1 1.8-1.5 3.2-1.5M17 14l3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </PlayerButton>
            <PlayerButton label="Previous service" onClick={() => go(-1)}>
              <path d="M5 5h2.5v14H5zM19 5v14L8 12z" fill="currentColor" />
            </PlayerButton>
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              aria-pressed={playing}
              aria-label={playing ? "Stop the record" : "Spin the record"}
              className="grid size-14 place-items-center rounded-full bg-ink text-cream hover:bg-brand"
            >
              <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
                {playing ? (
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
                ) : (
                  <path d="M8 4.5v15L20 12z" fill="currentColor" />
                )}
              </svg>
            </button>
            <PlayerButton label="Next service" onClick={() => go(1)}>
              <path d="M16.5 5H19v14h-2.5zM5 5v14l11-7z" fill="currentColor" />
            </PlayerButton>
            <PlayerButton label="First service" onClick={() => setIndex(0)}>
              <path
                d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </PlayerButton>
          </div>
        </div>
      ) : null}

      {/* Right: spinning record carrying the selected service's photos */}
      {current ? (
        <RecordPhotos key={current.id} service={current} playing={playing} />
      ) : null}
    </section>
  );
}

function PlayerButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full hover:bg-ink/10"
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function RecordPhotos({
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

  return (
    <div className="relative mt-12 lg:absolute lg:top-40 lg:left-[69%] lg:mt-0 lg:w-[56%]">
      <div className="drop-in relative mx-auto aspect-square w-full max-w-sm lg:ml-[4%] lg:max-w-none">
        <Image
          src="/vinyl.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 56vw, 24rem"
          className={cn(
            "spin-very-slow object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/35%)]",
            !playing && "paused",
          )}
        />
      </div>
      {/* On wide screens the photos sit on the record and spin with it. */}
      <ul
        className={cn(
          "spin-with-record mt-6 grid grid-cols-3 gap-3 lg:absolute lg:inset-0 lg:mt-0 lg:block",
          !playing && "paused",
        )}
      >
        {Array.from({ length: PHOTOS_PER_PAGE }, (_, i) => {
          const photo = photos[i];
          return (
            <li
              key={photo?.id ?? `placeholder-${i}`}
              className={cn(
                "relative aspect-square overflow-hidden bg-mauve shadow-md lg:absolute lg:w-[27%]",
                PHOTO_SPOTS[i],
              )}
            >
              {photo ? (
                <Image
                  src={photo.url}
                  alt={
                    photo.alt ||
                    `${service.name} tattoo ${page * PHOTOS_PER_PAGE + i + 1}`
                  }
                  fill
                  sizes="(min-width: 1024px) 15vw, 30vw"
                  className="object-cover"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3 font-semibold text-brand text-sm lg:absolute lg:-top-12 lg:left-0 lg:mt-0">
          <button
            type="button"
            className="grid size-10 place-items-center text-2xl disabled:opacity-30"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous photos"
          >
            ‹
          </button>
          <span>
            {page + 1} / {pages}
          </span>
          <button
            type="button"
            className="grid size-10 place-items-center text-2xl disabled:opacity-30"
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
