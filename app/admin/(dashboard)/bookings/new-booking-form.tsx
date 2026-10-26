"use client";

import { useForm } from "@tanstack/react-form";
import { ErrorMessage, Field, STATUS_LABELS } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { bookingStatusValues } from "@/db/app-schema";
import { useServerAction } from "@/lib/use-server-action";
import { adminBookingFormSchema } from "@/lib/validation/booking";
import { createAdminBookingAction } from "./actions";

type Props = {
  services: { id: string; name: string }[];
  today: string;
  onDone: () => void;
};

export function NewBookingForm({ services, today, onDone }: Props) {
  const create = useServerAction(createAdminBookingAction, {
    onSuccess: onDone,
  });
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      date: today,
      time: "11:00",
      serviceId: "",
      adminNote: "",
      status: "confirmed" as (typeof bookingStatusValues)[number],
    },
    validators: { onSubmit: adminBookingFormSchema },
    onSubmit: async ({ value }) => {
      await create.mutateAsync({
        ...value,
        serviceId: value.serviceId || null,
      });
    },
  });

  const text = [
    { name: "firstName", label: "First name", type: "text" },
    { name: "lastName", label: "Last name", type: "text" },
    { name: "phone", label: "Phone / WhatsApp", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "date", label: "Date", type: "date" },
    { name: "time", label: "Time", type: "time" },
  ] as const;

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit().catch(() => {});
      }}
    >
      {text.map(({ name, label, type }) => (
        <form.Field key={name} name={name}>
          {(field) => (
            <Field
              label={label}
              htmlFor={`new-${name}`}
              error={field.state.meta.errors[0]?.message}
            >
              <Input
                id={`new-${name}`}
                type={type}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>
      ))}
      <form.Field name="serviceId">
        {(field) => (
          <Field label="Service (optional)" htmlFor="new-service">
            <Select
              id="new-service"
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="">None</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </form.Field>
      <form.Field name="status">
        {(field) => (
          <Field label="Status" htmlFor="new-status">
            <Select
              id="new-status"
              value={field.state.value}
              onChange={(e) =>
                field.handleChange(e.target.value as typeof field.state.value)
              }
            >
              {bookingStatusValues.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </form.Field>
      <form.Field name="adminNote">
        {(field) => (
          <div className="sm:col-span-2">
            <Field label="Internal note (optional)" htmlFor="new-note">
              <Textarea
                id="new-note"
                rows={2}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          </div>
        )}
      </form.Field>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={create.isPending}>
          Create booking
        </Button>
        <p className="text-neutral-500 text-xs">
          The slot is created automatically if it does not exist yet.
        </p>
      </div>
      <div className="sm:col-span-2">
        <ErrorMessage error={create.error} />
      </div>
    </form>
  );
}
