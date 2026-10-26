"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Card, ErrorMessage } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useServerAction } from "@/lib/use-server-action";
import {
  addCustomerNoteAction,
  addCustomerTagAction,
  deleteCustomerAction,
  deleteCustomerNoteAction,
  removeCustomerTagAction,
  updateCustomerAction,
} from "../actions";
import { CustomerForm, type CustomerValues } from "../customer-fields";

type Props = {
  customer: CustomerValues & { id: string };
  tags: { id: string; name: string }[];
  suggestions: string[];
  notes: { id: string; body: string; createdAt: string }[];
};

export function CustomerDetail({ customer, tags, suggestions, notes }: Props) {
  const update = useServerAction(updateCustomerAction);
  const router = useRouter();
  const remove = useServerAction(deleteCustomerAction, {
    refresh: false,
    onSuccess: () => router.push("/admin/customers"),
  });
  const { id, ...initial } = customer;

  return (
    <>
      <Card title="Details">
        <CustomerForm
          idPrefix="customer"
          initial={initial}
          submitLabel="Save"
          pending={update.isPending}
          error={update.error}
          onSubmit={(values) => update.mutateAsync({ id, ...values })}
        />
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tags customerId={id} tags={tags} suggestions={suggestions} />
        <Notes customerId={id} notes={notes} />
      </div>
      <Card title="Danger zone">
        <Button
          variant="secondary"
          className="border-red-300 text-red-800"
          disabled={remove.isPending}
          onClick={() => {
            if (
              confirm(
                "Delete this customer and all their bookings? This frees their slots.",
              )
            ) {
              remove.mutate({ id });
            }
          }}
        >
          Delete customer
        </Button>
        <ErrorMessage error={remove.error} />
      </Card>
    </>
  );
}

function Tags({
  customerId,
  tags,
  suggestions,
}: {
  customerId: string;
  tags: Props["tags"];
  suggestions: string[];
}) {
  const [name, setName] = useState("");
  const listId = useId();
  const add = useServerAction(addCustomerTagAction, {
    onSuccess: () => setName(""),
  });
  const remove = useServerAction(removeCustomerTagAction);

  return (
    <Card title="Tags">
      <ul className="mb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex items-center gap-1 rounded-full bg-neutral-100 py-1 pr-1 pl-3 text-sm"
          >
            {tag.name}
            <button
              type="button"
              className="grid size-6 place-items-center rounded-full hover:bg-neutral-200"
              aria-label={`Remove tag ${tag.name}`}
              onClick={() => remove.mutate({ customerId, tagId: tag.id })}
            >
              ×
            </button>
          </li>
        ))}
        {tags.length === 0 ? (
          <li className="text-neutral-500 text-sm">No tags</li>
        ) : null}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim()) add.mutate({ customerId, name });
        }}
      >
        <Input
          aria-label="New tag"
          placeholder='e.g. "regular", "no deposit"'
          list={listId}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <Button type="submit" disabled={add.isPending}>
          Add
        </Button>
      </form>
      <ErrorMessage error={add.error ?? remove.error} />
    </Card>
  );
}

function Notes({
  customerId,
  notes,
}: {
  customerId: string;
  notes: Props["notes"];
}) {
  const [body, setBody] = useState("");
  const add = useServerAction(addCustomerNoteAction, {
    onSuccess: () => setBody(""),
  });
  const remove = useServerAction(deleteCustomerNoteAction);

  return (
    <Card title="Internal notes">
      <form
        className="mb-4 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) add.mutate({ customerId, body });
        }}
      >
        <Textarea
          aria-label="New note"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          type="submit"
          className="justify-self-start"
          disabled={add.isPending}
        >
          Add note
        </Button>
      </form>
      <ul className="grid gap-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="rounded-lg border border-neutral-200 p-3 text-sm"
          >
            <p className="whitespace-pre-wrap">{note.body}</p>
            <div className="mt-2 flex items-center justify-between text-neutral-500 text-xs">
              <span>{note.createdAt}</span>
              <button
                type="button"
                className="underline"
                onClick={() => remove.mutate({ id: note.id, customerId })}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ErrorMessage error={add.error ?? remove.error} />
    </Card>
  );
}
