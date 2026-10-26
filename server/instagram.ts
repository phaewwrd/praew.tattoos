import "server-only";

import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { type InstagramPost, instagramCache, siteSettings } from "@/db/schema";
import { ActionError } from "@/lib/server-response";
import { listFallbackImages } from "@/server/content";
import { updateSettings } from "@/server/settings";

// Instagram API with Instagram Login (graph.instagram.com).
// Long-lived tokens last ~60 days and can be refreshed once they are 24h old.
const GRAPH = "https://graph.instagram.com";
const MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const POST_LIMIT = 12;
const LONG_LIVED_SECONDS = 60 * 24 * 60 * 60;

export const INSTAGRAM_CACHE_TAG = "instagram";

type GraphError = { error?: { message?: string; code?: number } };

async function graphGet<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(path, GRAPH);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value);
  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as T & GraphError;
  if (!response.ok || body.error) {
    // Never include the URL: it contains the access token.
    throw new Error(
      `Instagram API ${response.status}: ${body.error?.message ?? "request failed"}`,
    );
  }
  return body;
}

/** Token from the DB, or copied from INSTAGRAM_ACCESS_TOKEN on first use. */
export async function getInstagramToken(): Promise<string | null> {
  const [row] = await db
    .select({ token: siteSettings.instagramToken })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (row?.token) return row.token;

  const fromEnv = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!fromEnv) return null;
  await updateSettings({ instagramToken: fromEnv });
  return fromEnv;
}

/** Admin: verify and store a new long-lived token. */
export async function saveInstagramToken(token: string) {
  try {
    await graphGet("/me", { fields: "id,username", access_token: token });
  } catch {
    throw new ActionError("INVALID_INPUT", "Instagram rejected this token.");
  }
  await updateSettings({
    instagramToken: token,
    // Estimate: a freshly generated long-lived token is valid for ~60 days.
    instagramTokenExpiresAt: new Date(Date.now() + LONG_LIVED_SECONDS * 1000),
    instagramTokenRefreshedAt: new Date(),
  });
}

/** Exchanges the current long-lived token for a new one (called daily by Vercel Cron). */
export async function refreshInstagramToken() {
  const token = await getInstagramToken();
  if (!token) return { refreshed: false, reason: "no token" as const };

  const result = await graphGet<{ access_token: string; expires_in: number }>(
    "/refresh_access_token",
    { grant_type: "ig_refresh_token", access_token: token },
  );
  const expiresAt = new Date(Date.now() + result.expires_in * 1000);
  await updateSettings({
    instagramToken: result.access_token,
    instagramTokenExpiresAt: expiresAt,
    instagramTokenRefreshedAt: new Date(),
  });
  return { refreshed: true, expiresAt: expiresAt.toISOString() };
}

type GraphMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

async function fetchLivePosts(): Promise<InstagramPost[]> {
  const token = await getInstagramToken();
  if (!token) throw new Error("Instagram token is not configured.");
  const { data } = await graphGet<{ data: GraphMedia[] }>("/me/media", {
    fields: MEDIA_FIELDS,
    limit: String(POST_LIMIT),
    access_token: token,
  });
  return data.flatMap((media) => {
    const imageUrl =
      media.media_type === "VIDEO" ? media.thumbnail_url : media.media_url;
    if (!imageUrl) return [];
    return [
      {
        id: media.id,
        permalink: media.permalink,
        imageUrl,
        caption: media.caption ?? null,
        timestamp: media.timestamp,
      },
    ];
  });
}

export type InstagramFeed = {
  source: "live" | "cache" | "fallback";
  posts: { id: string; href: string | null; imageUrl: string; alt: string }[];
};

function toFeedPosts(posts: InstagramPost[]): InstagramFeed["posts"] {
  return posts.map((post) => ({
    id: post.id,
    href: post.permalink,
    imageUrl: post.imageUrl,
    alt: post.caption?.slice(0, 120) || "Instagram post by Praew.Tattoos",
  }));
}

async function loadFeed(): Promise<InstagramFeed> {
  try {
    const posts = await fetchLivePosts();
    const fetchedAt = new Date();
    await db
      .insert(instagramCache)
      .values({ id: 1, posts, fetchedAt })
      .onConflictDoUpdate({
        target: instagramCache.id,
        set: { posts, fetchedAt },
      });
    return { source: "live", posts: toFeedPosts(posts) };
  } catch (error) {
    console.error(
      "Instagram fetch failed; using cache/fallback.",
      (error as Error).message,
    );
  }

  const [cached] = await db
    .select()
    .from(instagramCache)
    .where(eq(instagramCache.id, 1));
  if (cached?.posts.length)
    return { source: "cache", posts: toFeedPosts(cached.posts) };

  const fallback = await listFallbackImages();
  return {
    source: "fallback",
    posts: fallback.map((image) => ({
      id: image.id,
      href: null,
      imageUrl: image.url,
      alt: image.alt || "Tattoo by Praew.Tattoos",
    })),
  };
}

/** Cached for an hour; on API failure serves the last cached posts, then fallback images. */
export const getInstagramFeed = unstable_cache(loadFeed, ["instagram-feed"], {
  revalidate: 3600,
  tags: [INSTAGRAM_CACHE_TAG],
});
