import "dotenv/config";
import { Pool } from "@neondatabase/serverless";

// Drops every table in the target database. Run `pnpm db:migrate` and `pnpm db:seed` afterwards.
// Requires `--yes <host>` where <host> matches the DATABASE_URL host, so the wrong DB can't be reset by accident.

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const { host, pathname } = new URL(url);
  console.log(`Target database: ${host}${pathname}`);

  const flag = process.argv.indexOf("--yes");
  if (flag === -1 || process.argv[flag + 1] !== host) {
    console.log(`Re-run with: pnpm db:reset --yes ${host}`);
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString: url });
  await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
  await pool.query("DROP SCHEMA public CASCADE");
  await pool.query("CREATE SCHEMA public");
  await pool.end();
  console.log("Database reset: public and drizzle schemas dropped.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
