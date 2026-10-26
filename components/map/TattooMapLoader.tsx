"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so it must skip SSR.
const TattooMap = dynamic(
  () => import("./TattooMap").then((mod) => mod.TattooMap),
  { ssr: false },
);

export function TattooMapLoader() {
  return <TattooMap />;
}
