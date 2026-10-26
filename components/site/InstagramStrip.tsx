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
  console.log("Instagram feed:", feed);

  return (
    <section
      id="instagram"
      aria-labelledby="instagram-title"
      className="scroll-mt-6 py-8 lg:py-0"
    >
      <h2
        id="instagram-title"
        className="mb-4 font-semibold text-2xl text-brand uppercase"
      >
        <a
          href={instagramUrl(handle)}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:underline"
        >
          Instagram
          <span className="sr-only"> @{handle} (opens in a new tab)</span>
        </a>
      </h2>
      {feed.posts.length === 0 ? (
        <p className="font-hand text-2xl text-ink/70">
          New work coming soon. Follow along on Instagram.
        </p>
      ) : (
        <>
          <ul
            ref={rowRef}
            className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto"
          >
            {feed.posts.map((post) => {
              const image = (
                <Image
                  src={post.imageUrl}
                  alt={post.alt}
                  fill
                  sizes="(min-width: 1024px) 8rem, 30vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              );
              return (
                <li
                  key={post.id}
                  className="w-[30vw] shrink-0 snap-start sm:w-32"
                >
                  {post.href ? (
                    <a
                      href={post.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-square overflow-hidden bg-mauve"
                      aria-label={`Open on Instagram: ${post.alt}`}
                    >
                      {image}
                    </a>
                  ) : (
                    <div className="group relative aspect-square overflow-hidden bg-mauve">
                      {image}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex justify-end gap-1 text-brand">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous posts"
              className="grid size-10 place-items-center text-3xl hover:bg-brand/10"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next posts"
              className="grid size-10 place-items-center text-3xl hover:bg-brand/10"
            >
              ›
            </button>
          </div>
        </>
      )}
    </section>
  );
}
