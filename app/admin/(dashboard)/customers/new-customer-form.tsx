"use client";

import { useRouter } from "next/navigation";
import { useServerAction } from "@/lib/use-server-action";
import { createCustomerAction } from "./actions";
import { CustomerForm } from "./customer-fields";

export function NewCustomerForm() {
  const router = useRouter();
  const create = useServerAction(createCustomerAction, {
    onSuccess: (id) => router.push(`/admin/customers/${id}`),
  });
  return (
    <CustomerForm
      idPrefix="new-customer"
      initial={{ firstName: "", lastName: "", email: "", phone: "" }}
      submitLabel="Add customer"
      pending={create.isPending}
      error={create.error}
      onSubmit={(values) => create.mutateAsync(values)}
    />
  );
}
