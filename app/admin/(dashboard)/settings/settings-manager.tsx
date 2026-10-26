"use client";

import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Card,
  ErrorMessage,
  Field,
  moveItem,
  ReorderButtons,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatInstant } from "@/lib/time";
import { useServerAction } from "@/lib/use-server-action";
import {
  changePasswordSchema,
  type SiteSettingsInput,
  siteSettingsSchema,
} from "@/lib/validation/admin";
import {
  addFallbackImagesAction,
  changePasswordAction,
  deleteFallbackImageAction,
  reorderFallbackImagesAction,
  saveInstagramTokenAction,
  updateSettingsAction,
} from "./actions";

type Props = {
  studio: SiteSettingsInput;
  token: {
    hasToken: boolean;
    storedInDb: boolean;
    expiresAt: string | null;
    refreshedAt: string | null;
  };
  fallbackImages: { id: string; url: string }[];
};

const STUDIO_FIELDS: {
  name: keyof SiteSettingsInput;
  label: string;
  type?: string;
}[] = [
  { name: "studioName", label: "Studio name" },
  { name: "city", label: "City" },
  { name: "locationNote", label: "Location note (public)" },
  { name: "mrtInfo", label: "MRT info" },
  { name: "mapUrl", label: "Map link", type: "url" },
  { name: "openingHours", label: "Opening hours" },
  { name: "instagramHandle", label: "Instagram handle" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "whatsapp", label: "WhatsApp", type: "tel" },
  { name: "email", label: "Email", type: "email" },
];

export function SettingsManager({ studio, token, fallbackImages }: Props) {
  return (
    <div className="grid gap-6">
      <StudioForm studio={studio} />
      <InstagramCard token={token} fallbackImages={fallbackImages} />
      <PasswordForm />
    </div>
  );
}

function StudioForm({ studio }: { studio: SiteSettingsInput }) {
  const update = useServerAction(updateSettingsAction);
  const [saved, setSaved] = useState(false);
  const form = useForm({
    defaultValues: studio,
    validators: { onSubmit: siteSettingsSchema },
    onSubmit: async ({ value }) => {
      setSaved(false);
      await update.mutateAsync(value);
      setSaved(true);
    },
  });

  return (
    <Card title="Studio info">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit().catch(() => {});
        }}
      >
        {STUDIO_FIELDS.map(({ name, label, type }) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <Field
                label={label}
                htmlFor={`settings-${name}`}
                error={field.state.meta.errors[0]?.message}
              >
                <Input
                  id={`settings-${name}`}
                  type={type ?? "text"}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        ))}
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={update.isPending}>
            Save
          </Button>
          {saved ? (
            <p className="text-emerald-700 text-sm" role="status">
              Saved.
            </p>
          ) : null}
          <ErrorMessage error={update.error} />
        </div>
      </form>
    </Card>
  );
}

function InstagramCard({
  token,
  fallbackImages,
}: Pick<Props, "token" | "fallbackImages">) {
  const [value, setValue] = useState("");
  const save = useServerAction(saveInstagramTokenAction, {
    onSuccess: () => setValue(""),
  });
  const add = useServerAction(addFallbackImagesAction);
  const remove = useServerAction(deleteFallbackImageAction);
  const reorder = useServerAction(reorderFallbackImagesAction);
  const expiresAt = token.expiresAt ? new Date(token.expiresAt) : null;
  const daysLeft = expiresAt
    ? Math.floor((expiresAt.getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <Card title="Instagram">
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-[12rem_1fr]">
        <dt className="text-neutral-500">Token</dt>
        <dd>
          {!token.hasToken
            ? "Missing: set INSTAGRAM_ACCESS_TOKEN or paste one below"
            : token.storedInDb
              ? "Stored in database"
              : "From environment (copied to DB on first use)"}
        </dd>
        <dt className="text-neutral-500">Expires</dt>
        <dd
          className={
            daysLeft !== null && daysLeft < 10 ? "text-red-700" : undefined
          }
        >
          {expiresAt
            ? `${formatInstant(expiresAt)} (${daysLeft} days)`
            : "Unknown"}
        </dd>
        <dt className="text-neutral-500">Last refreshed</dt>
        <dd>
          {token.refreshedAt
            ? formatInstant(new Date(token.refreshedAt))
            : "Never"}
        </dd>
      </dl>
      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate({ token: value });
        }}
      >
        <div className="min-w-64 flex-1">
          <Field
            label="Replace token"
            htmlFor="ig-token"
            hint="Long-lived Instagram Login token. It is verified before saving."
          >
            <Input
              id="ig-token"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit" disabled={save.isPending || value.length < 20}>
          Save token
        </Button>
        <ErrorMessage error={save.error} />
      </form>

      <div className="grid gap-3 border-neutral-200 border-t pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-medium text-sm">
            Fallback images (shown when Instagram is unavailable and nothing is
            cached)
          </h3>
          <ImageUploader
            target="instagram-fallback"
            label="Upload images"
            multiple
            onUploaded={(images) => add.mutateAsync({ images }).then(() => {})}
          />
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {fallbackImages.map((image, index) => (
            <li key={image.id} className="grid gap-2">
              <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <ReorderButtons
                  index={index}
                  count={fallbackImages.length}
                  label={`image ${index + 1}`}
                  disabled={reorder.isPending}
                  onMove={(from, to) =>
                    reorder.mutate({
                      ids: moveItem(fallbackImages, from, to).map((i) => i.id),
                    })
                  }
                />
                <Button
                  variant="link"
                  className="text-red-700 text-xs"
                  aria-label={`Delete image ${index + 1}`}
                  onClick={() => remove.mutate({ id: image.id })}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <ErrorMessage error={add.error ?? remove.error ?? reorder.error} />
      </div>
    </Card>
  );
}

function PasswordForm() {
  const change = useServerAction(changePasswordAction, { refresh: false });
  const [done, setDone] = useState(false);
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      setDone(false);
      await change.mutateAsync(value);
      setDone(true);
      form.reset();
    },
  });
  const fields = [
    {
      name: "currentPassword",
      label: "Current password",
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: "New password",
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Confirm new password",
      autoComplete: "new-password",
    },
  ] as const;

  return (
    <Card title="Change password">
      <form
        className="grid max-w-md gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit().catch(() => {});
        }}
      >
        {fields.map(({ name, label, autoComplete }) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <Field
                label={label}
                htmlFor={`pw-${name}`}
                error={field.state.meta.errors[0]?.message}
              >
                <Input
                  id={`pw-${name}`}
                  type="password"
                  autoComplete={autoComplete}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        ))}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={change.isPending}>
            Change password
          </Button>
          {done ? (
            <p className="text-emerald-700 text-sm" role="status">
              Password changed. Other sessions were signed out.
            </p>
          ) : null}
        </div>
        <ErrorMessage error={change.error} />
      </form>
    </Card>
  );
}
