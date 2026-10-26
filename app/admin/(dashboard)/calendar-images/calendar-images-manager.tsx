"use client";

import Image from "next/image";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Card, ErrorMessage } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { monthName } from "@/lib/time";
import { useServerAction } from "@/lib/use-server-action";
import {
  removeMonthImageAction,
  setHeartImageAction,
  setMonthImageAction,
} from "./actions";

type Props = {
  images: { month: number; url: string }[];
  heartImageUrl: string | null;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function CalendarImagesManager({ images, heartImageUrl }: Props) {
  const setMonth = useServerAction(setMonthImageAction);
  const removeMonth = useServerAction(removeMonthImageAction);
  const setHeart = useServerAction(setHeartImageAction);
  const byMonth = new Map(images.map((image) => [image.month, image.url]));

  return (
    <div className="grid gap-6">
      <Card title="Heart over the selected day">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative grid size-24 place-items-center rounded bg-neutral-100">
            {heartImageUrl ? (
              <Image
                src={heartImageUrl}
                alt="Heart drawing"
                fill
                sizes="96px"
                className="object-contain"
              />
            ) : (
              <span className="text-neutral-500 text-xs">Default SVG</span>
            )}
          </div>
          <ImageUploader
            target="calendar"
            label={heartImageUrl ? "Replace heart" : "Upload heart"}
            onUploaded={([image]) => setHeart.mutateAsync(image).then(() => {})}
          />
          {heartImageUrl ? (
            <Button variant="secondary" onClick={() => setHeart.mutate(null)}>
              Use default
            </Button>
          ) : null}
        </div>
        <ErrorMessage error={setHeart.error} />
      </Card>

      <Card title="Monthly images">
        <p className="mb-4 text-neutral-600 text-sm">
          Months without an image show the mushroom illustration.
        </p>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MONTHS.map((month) => {
            const url = byMonth.get(month);
            const name = monthName(`2026-${String(month).padStart(2, "0")}`);
            return (
              <li
                key={month}
                className="grid gap-2 rounded-lg border border-neutral-200 p-3"
              >
                <p className="font-medium text-sm">{name}</p>
                <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
                  {url ? (
                    <Image
                      src={url}
                      alt={`${name} illustration`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-neutral-500 text-xs">
                      Mushroom (default)
                    </span>
                  )}
                </div>
                <ImageUploader
                  target="calendar"
                  label={url ? "Replace" : "Upload"}
                  onUploaded={([image]) =>
                    setMonth.mutateAsync({ month, ...image }).then(() => {})
                  }
                />
                {url ? (
                  <Button
                    variant="link"
                    className="justify-self-start text-red-700 text-sm"
                    onClick={() => removeMonth.mutate({ month })}
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
        <ErrorMessage error={setMonth.error ?? removeMonth.error} />
      </Card>
    </div>
  );
}
