import { PageHeader } from "@/components/admin/ui";
import { listFaqs } from "@/server/content";
import { FaqManager } from "./faq-manager";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const faqs = await listFaqs();
  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions and answers shown on /faq."
      />
      <FaqManager
        faqs={faqs.map(({ id, question, answer }) => ({
          id,
          question,
          answer,
        }))}
      />
    </>
  );
}
