"use client";

import { useForm } from "@tanstack/react-form";
import {
  Card,
  ErrorMessage,
  Field,
  moveItem,
  ReorderButtons,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useServerAction } from "@/lib/use-server-action";
import { faqSchema } from "@/lib/validation/admin";
import {
  createFaqAction,
  deleteFaqAction,
  reorderFaqsAction,
  updateFaqAction,
} from "./actions";

type FaqItem = { id: string; question: string; answer: string };

export function FaqManager({ faqs }: { faqs: FaqItem[] }) {
  const reorder = useServerAction(reorderFaqsAction);
  return (
    <div className="grid gap-6">
      <Card title="Add question">
        <FaqForm />
      </Card>
      {faqs.map((faq, index) => (
        <Card key={faq.id}>
          <div className="flex items-start gap-4">
            <FaqForm faq={faq} />
            <ReorderButtons
              index={index}
              count={faqs.length}
              label="question"
              disabled={reorder.isPending}
              onMove={(from, to) =>
                reorder.mutate({
                  ids: moveItem(faqs, from, to).map((f) => f.id),
                })
              }
            />
          </div>
        </Card>
      ))}
      <ErrorMessage error={reorder.error} />
    </div>
  );
}

function FaqForm({ faq }: { faq?: FaqItem }) {
  const create = useServerAction(createFaqAction, {
    onSuccess: () => form.reset(),
  });
  const update = useServerAction(updateFaqAction);
  const remove = useServerAction(deleteFaqAction);
  const mutation = faq ? update : create;
  const prefix = faq?.id ?? "new";

  const form = useForm({
    defaultValues: { question: faq?.question ?? "", answer: faq?.answer ?? "" },
    validators: { onSubmit: faqSchema },
    onSubmit: async ({ value }) => {
      if (faq) await update.mutateAsync({ id: faq.id, ...value });
      else await create.mutateAsync(value);
    },
  });

  return (
    <form
      className="grid flex-1 gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit().catch(() => {});
      }}
    >
      <form.Field name="question">
        {(field) => (
          <Field
            label="Question"
            htmlFor={`${prefix}-q`}
            error={field.state.meta.errors[0]?.message}
          >
            <Input
              id={`${prefix}-q`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="answer">
        {(field) => (
          <Field
            label="Answer"
            htmlFor={`${prefix}-a`}
            error={field.state.meta.errors[0]?.message}
          >
            <Textarea
              id={`${prefix}-a`}
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {faq ? "Save" : "Add"}
        </Button>
        {faq ? (
          <Button
            variant="secondary"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm("Delete this question?"))
                remove.mutate({ id: faq.id });
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
      <ErrorMessage error={mutation.error ?? remove.error} />
    </form>
  );
}
