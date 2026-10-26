import { NextResponse } from "next/server";

export async function GET() {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_API_VERSION;

  if (!accountId || !accessToken || !version) {
    return NextResponse.json(
      { error: "Instagram API is not configured." },
      { status: 500 },
    );
  }

  const url = new URL(
    `https://graph.facebook.com/${version}/${accountId}/media`,
  );

  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
  );
  url.searchParams.set("limit", "16");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 300 },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Instagram API request failed:", result.error);

      return NextResponse.json(
        { error: "Unable to load Instagram posts.", debug: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ posts: result.data ?? [] });
  } catch (error) {
    console.error("Instagram request error:", error);

    return NextResponse.json(
      { error: "Instagram service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
