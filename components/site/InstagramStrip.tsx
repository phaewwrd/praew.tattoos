"use client";

import Image from "next/image";
import { useRef } from "react";
import { instagramUrl } from "@/lib/contact-links";
import type { InstagramFeed } from "@/server/instagram";

export function InstagramStrip({
  feed,
  handle,
}: {
  feed: InstagramFeed;
  handle: string;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollBy({
      left: direction * row.clientWidth * 0.8,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-title"
      className="scroll-mt-6 px-4 py-8 sm:px-8"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2
          id="instagram-title"
          className="font-black text-2xl text-brand uppercase tracking-wider"
        >
          Instagram{" "}
          <a
            href={instagramUrl(handle)}
            target="_blank"
            rel="noreferrer"
            className="ml-2 font-hand text-2xl text-ink normal-case tracking-normal underline-offset-4 hover:underline"
          >
            @{handle}
          </a>
        </h2>
        {feed.posts.length > 0 ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous posts"
              className="grid size-11 place-items-center rounded-full border-2 border-ink bg-paper font-black text-xl hover:bg-butter"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next posts"
              className="grid size-11 place-items-center rounded-full border-2 border-ink bg-brand font-black text-cream text-xl hover:bg-brand-dark"
            >
              →
            </button>
          </div>
        ) : null}
      </div>
      {feed.posts.length === 0 ? (
        <p className="font-hand text-2xl text-ink/70">
          New work coming soon. Follow along on Instagram.
        </p>
      ) : (
        <ul
          ref={rowRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
        >
          {feed.posts.map((post, i) => {
            const image = (
              <Image
                src={post.imageUrl}
                alt={post.alt}
                fill
                sizes="(min-width: 640px) 13rem, 42vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            );
            return (
              <li
                key={post.id}
                className={`w-[42vw] shrink-0 snap-start sm:w-52 ${i % 2 ? "rotate-1" : "-rotate-1"}`}
              >
                {post.href ? (
                  <a
                    href={post.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-square overflow-hidden border-4 border-paper bg-mauve shadow-md"
                    aria-label={`Open on Instagram: ${post.alt}`}
                  >
                    {image}
                  </a>
                ) : (
                  <div className="group relative aspect-square overflow-hidden border-4 border-paper bg-mauve shadow-md">
                    {image}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
