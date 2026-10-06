/**
 * db-push-via-api.mjs
 *
 * NETWORK-RESTRICTION-PROOF db push for Supabase.
 *
 * Problem: prisma db push needs a direct TCP connection to Supabase on ports
 * 5432 or 6543. Hostel LANs, college WiFi, and most mobile hotspots block
 * those ports at the carrier/firewall level.
 *
 * Solution: Use Supabase's Management REST API (port 443 HTTPS — always open)
 * to POST the migration SQL directly to Supabase without needing any TCP
 * Postgres connection from your machine.
 *
 * HOW TO USE:
 *   1. Get your Supabase Management API token from:
 *      https://supabase.com/dashboard/account/tokens
 *   2. Run:
 *      node scripts/db-push-via-api.mjs
 *
 * The script will:
 *   - Run `prisma migrate diff --from-schema-datasource --to-schema-datamodel`
 *     to compute the delta SQL (only changes since last push).
 *   - POST that SQL to the Supabase Management API.
 *   - Report success or failure per statement.
 */

import { execSync } from "child_process";
import { createInterface } from "readline";

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_REF = "fctanziyohhansctrdvt"; // your Supabase project ref
const SUPABASE_MANAGEMENT_API = "https://api.supabase.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

function prompt(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runSqlViaApi(token, sql) {
  const url = `${SUPABASE_MANAGEMENT_API}/v1/projects/${PROJECT_REF}/database/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    throw new Error(
      `API error ${res.status}: ${json?.message ?? json?.error ?? text}`
    );
  }
  return json;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(64));
  console.log("  db-push-via-api  --  network-restriction-proof Prisma push");
  console.log("=".repeat(64) + "\n");

  // 1. Get Management API token
  let token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  if (!token) {
    console.log("Need your Supabase Management API token.");
    console.log("Get it from: https://supabase.com/dashboard/account/tokens\n");
    token = await prompt("Paste token: ");
  }
  if (!token) {
    console.error("No token provided. Aborting.");
    process.exit(1);
  }

  // 2. Compute the migration diff (schema delta)
  console.log("\nComputing schema diff (what needs to change in DB)...");
  let diffSql;
  try {
    try {
      diffSql = execSync(
        "npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script",
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
      );
      console.log("   Got incremental diff (only changes since last push)");
    } catch (err) {
      console.warn("   Could not connect to DB for incremental diff (expected on restricted networks).");
      console.warn("   Falling back to full schema (--from-empty). Safe to run multiple times.");
      diffSql = execSync(
        "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
      );
      diffSql = makeIdempotent(diffSql);
      console.log("   Got full schema SQL (made idempotent)");
    }
  } catch (err) {
    console.error("prisma migrate diff failed:", err.message);
    process.exit(1);
  }

  if (!diffSql || diffSql.trim() === "" || diffSql.trim() === "-- This is an empty migration.") {
    console.log("\nNo schema changes detected -- database is already up to date!");
    return;
  }

  const lines = diffSql.split("\n").length;
  console.log(`\nMigration SQL ready (${lines} lines). Sending to Supabase via HTTPS...\n`);

  // 3. Execute via Management API
  try {
    await runSqlViaApi(token, diffSql);
    console.log("\nSchema pushed successfully!\n");
  } catch (err) {
    console.warn("Bulk execution failed:", err.message);
    console.log("   Retrying statement-by-statement...\n");

    const statements = diffSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let ok = 0;
    let failed = 0;
    for (const stmt of statements) {
      try {
        await runSqlViaApi(token, stmt + ";");
        process.stdout.write(".");
        ok++;
      } catch (e) {
        const shortMsg = e.message.slice(0, 120);
        if (shortMsg.includes("already exists")) {
          process.stdout.write("s");
          ok++;
        } else {
          console.error(`\n   Failed: ${stmt.slice(0, 80)}...\n      ${shortMsg}`);
          failed++;
        }
      }
    }
    console.log(`\n\nDone: ${ok} OK, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  }

  // 4. Regenerate Prisma Client
  console.log("Regenerating Prisma Client...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("Prisma Client regenerated.\n");
  } catch {
    console.warn("prisma generate failed -- run it manually: npx prisma generate\n");
  }
}

/**
 * Convert full-schema SQL to be idempotent so it can be run multiple times
 * without failing on "already exists" errors.
 */
function makeIdempotent(sql) {
  return sql
    .replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "')
    .replace(/CREATE INDEX "/g, 'CREATE INDEX IF NOT EXISTS "')
    .replace(/CREATE UNIQUE INDEX "/g, 'CREATE UNIQUE INDEX IF NOT EXISTS "')
    .replace(/CREATE TYPE "/g, 'CREATE TYPE IF NOT EXISTS "');
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
