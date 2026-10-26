"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ErrorMessage, Field } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  emailSchema,
  personNameSchema,
  phoneSchema,
} from "@/lib/validation/common";

export type CustomerValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const formSchema = z
  .object({
    firstName: personNameSchema,
    lastName: personNameSchema,
    email: z.literal("").or(emailSchema),
    phone: z.literal("").or(phoneSchema),
  })
  .refine((v) => v.email || v.phone, {
    message: "Add an email or phone",
    path: ["email"],
  });

const FIELDS = [
  { name: "firstName", label: "First name", type: "text" },
  { name: "lastName", label: "Last name", type: "text" },
  { name: "phone", label: "Phone / WhatsApp", type: "tel" },
  { name: "email", label: "Email", type: "email" },
] as const;

export function CustomerForm({
  idPrefix,
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  idPrefix: string;
  initial: CustomerValues;
  submitLabel: string;
  pending: boolean;
  error: Error | null;
  onSubmit: (values: CustomerValues) => Promise<unknown>;
}) {
  const form = useForm({
    defaultValues: initial,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit().catch(() => {});
      }}
    >
      {FIELDS.map(({ name, label, type }) => (
        <form.Field key={name} name={name}>
          {(field) => (
            <Field
              label={label}
              htmlFor={`${idPrefix}-${name}`}
              error={field.state.meta.errors[0]?.message}
            >
              <Input
                id={`${idPrefix}-${name}`}
                type={type}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        <ErrorMessage error={error} />
      </div>
    </form>
  );
}
