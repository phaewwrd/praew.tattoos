import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { account, faqs, services, siteSettings, user } from "@/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-defaults";

// Idempotent: safe to run repeatedly. Never overwrites admin edits.

const SERVICES = [
  { name: "Minimal Tattoo", priceThb: 1500, sortOrder: 0 },
  { name: "Realistic", priceThb: 2500, sortOrder: 1 },
  { name: "Color Realistic", priceThb: 2500, sortOrder: 2 },
];

const FAQS = [
  {
    question: "How do I book an appointment?",
    answer:
      "Pick a free day and time in the booking calendar and send your request. The studio will email you to confirm and arrange the deposit.",
  },
  {
    question: "Do I need to pay a deposit?",
    answer:
      "Yes. Once your request is confirmed, the studio will send deposit details by email. Your slot is secured after the deposit is received.",
  },
  {
    question: "Where is the studio?",
    answer:
      "We are in Bangkok, about 10 minutes' walk from MRT Bangson (exit 5). Full studio details are shared with confirmed appointments.",
  },
  {
    question: "How should I prepare for my session?",
    answer:
      "Get a good night's sleep, eat beforehand, stay hydrated and avoid alcohol for 24 hours before your appointment.",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8 || password.length > 128) {
    throw new Error(
      "Set ADMIN_EMAIL and an ADMIN_PASSWORD between 8 and 128 characters.",
    );
  }

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  if (existing) {
    await db
      .update(user)
      .set({ role: "admin", disabled: false })
      .where(eq(user.id, existing.id));
    console.log("Admin already exists; password left unchanged.");
    return;
  }

  const userId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: "Praew",
      email,
      emailVerified: true,
      role: "admin",
    });
    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: await hashPassword(password),
    });
  });
  console.log("Admin account created.");
}

async function main() {
  await seedAdmin();

  await db
    .insert(siteSettings)
    .values({ id: 1, ...DEFAULT_SITE_SETTINGS })
    .onConflictDoNothing();

  await db.insert(services).values(SERVICES).onConflictDoNothing();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(faqs);
  if (count === 0) {
    await db
      .insert(faqs)
      .values(FAQS.map((faq, sortOrder) => ({ ...faq, sortOrder })));
  }

  console.log("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
