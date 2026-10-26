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
import { useServerAction } from "@/lib/use-server-action";
import { serviceSchema } from "@/lib/validation/admin";
import type { ServiceWithImages } from "@/server/services";
import {
  addServiceImagesAction,
  createServiceAction,
  deleteServiceAction,
  deleteServiceImageAction,
  reorderServiceImagesAction,
  reorderServicesAction,
  updateServiceAction,
  updateServiceImageAltAction,
} from "./actions";

export function ServicesManager({
  services,
}: {
  services: ServiceWithImages[];
}) {
  const reorder = useServerAction(reorderServicesAction);

  return (
    <div className="grid gap-6">
      <Card title="Add service">
        <ServiceForm />
      </Card>
      {services.length === 0 ? (
        <p className="text-neutral-600">No services yet.</p>
      ) : null}
      {services.map((service, index) => (
        <Card key={service.id}>
          <div className="mb-4 flex items-start justify-between gap-4">
            <ServiceForm service={service} />
            <ReorderButtons
              index={index}
              count={services.length}
              label={service.name}
              disabled={reorder.isPending}
              onMove={(from, to) =>
                reorder.mutate({
                  ids: moveItem(services, from, to).map((s) => s.id),
                })
              }
            />
          </div>
          <ServicePhotos service={service} />
        </Card>
      ))}
      <ErrorMessage error={reorder.error} />
    </div>
  );
}

function ServiceForm({ service }: { service?: ServiceWithImages }) {
  const create = useServerAction(createServiceAction, {
    onSuccess: () => form.reset(),
  });
  const update = useServerAction(updateServiceAction);
  const remove = useServerAction(deleteServiceAction);
  const mutation = service ? update : create;
  const prefix = service?.id ?? "new";

  const form = useForm({
    defaultValues: {
      name: service?.name ?? "",
      priceThb: service?.priceThb ?? 0,
    },
    validators: { onSubmit: serviceSchema },
    onSubmit: async ({ value }) => {
      if (service) await update.mutateAsync({ id: service.id, ...value });
      else await create.mutateAsync(value);
    },
  });

  return (
    <form
      className="grid flex-1 gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit().catch(() => {});
      }}
    >
      <form.Field name="name">
        {(field) => (
          <Field
            label="Name"
            htmlFor={`${prefix}-name`}
            error={field.state.meta.errors[0]?.message}
          >
            <Input
              id={`${prefix}-name`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="priceThb">
        {(field) => (
          <Field
            label="Start price (THB)"
            htmlFor={`${prefix}-price`}
            error={field.state.meta.errors[0]?.message}
          >
            <Input
              id={`${prefix}-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber || 0)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {service ? "Save" : "Add"}
        </Button>
        {service ? (
          <Button
            variant="secondary"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm(`Delete "${service.name}" and all its photos?`)) {
                remove.mutate({ id: service.id });
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
      <div className="sm:col-span-3">
        <ErrorMessage error={mutation.error ?? remove.error} />
      </div>
    </form>
  );
}

function ServicePhotos({ service }: { service: ServiceWithImages }) {
  const add = useServerAction(addServiceImagesAction);
  const remove = useServerAction(deleteServiceImageAction);
  const reorder = useServerAction(reorderServiceImagesAction);
  const images = service.images;

  return (
    <div className="grid gap-3 border-neutral-200 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-medium text-sm">Photos ({images.length})</h3>
        <ImageUploader
          target="services"
          label="Upload photos"
          multiple
          onUploaded={(uploaded) =>
            add
              .mutateAsync({ serviceId: service.id, images: uploaded })
              .then(() => {})
          }
        />
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <li
            key={image.id}
            className="grid gap-2 rounded-lg border border-neutral-200 p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
              <Image
                src={image.url}
                alt={image.alt || service.name}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <AltInput id={image.id} alt={image.alt} />
            <div className="flex items-center justify-between">
              <ReorderButtons
                index={index}
                count={images.length}
                label={`photo ${index + 1}`}
                disabled={reorder.isPending}
                onMove={(from, to) =>
                  reorder.mutate({
                    serviceId: service.id,
                    ids: moveItem(images, from, to).map((i) => i.id),
                  })
                }
              />
              <Button
                variant="link"
                className="text-red-700 text-sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm("Delete this photo?"))
                    remove.mutate({ id: image.id });
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <ErrorMessage error={add.error ?? remove.error ?? reorder.error} />
    </div>
  );
}

function AltInput({ id, alt }: { id: string; alt: string }) {
  const [value, setValue] = useState(alt);
  const update = useServerAction(updateServiceImageAltAction);
  return (
    <Input
      aria-label="Alt text"
      placeholder="Alt text"
      className="text-sm"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== alt) update.mutate({ id, alt: value });
      }}
    />
  );
}
