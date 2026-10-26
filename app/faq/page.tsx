import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listFaqs } from "@/server/content";
import { getPublicSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "Answers to common questions about booking a tattoo with Praew.Tattoos in Bangkok.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [settings, faqs] = await Promise.all([getPublicSettings(), listFaqs()]);
  return (
    <div className="paper-bg flex min-h-dvh flex-col">
      <SiteHeader settings={settings} home={false} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
        <h1 className="mb-8 font-black text-3xl text-brand uppercase tracking-wider">
          Questions
        </h1>
        {faqs.length === 0 ? (
          <p className="font-hand text-2xl">No questions yet.</p>
        ) : (
          <div className="grid gap-4">
            {faqs.map((faq, i) => (
              <details
                key={faq.id}
                className={`group border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_var(--color-ink)] ${i % 2 ? "rotate-[0.4deg]" : "-rotate-[0.4deg]"}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-lg [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-2xl text-brand transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-ink/80 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        )}
        <Link
          href="/#booking"
          className="mt-10 inline-block border-2 border-ink bg-brand px-6 py-3 font-black text-cream uppercase tracking-widest shadow-[4px_4px_0_var(--color-ink)] hover:bg-brand-dark"
        >
          Book an appointment
        </Link>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
