import bcrypt from "bcryptjs";
import { db } from "./lib/db.js";
import { adminUsers } from "./schema/index.js";
import { eq } from "drizzle-orm";

// Fix 5 — Require explicit env vars. Never fall back to hardcoded credentials.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error(
    "Error: ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment " +
    "before running the seed script."
  );
  process.exit(1);
}

async function seed() {
  console.log("Starting database seed...");

  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, ADMIN_USERNAME!));

  if (existing) {
    console.log(`Admin user '${ADMIN_USERNAME}' already exists.`);
    const hash = await bcrypt.hash(ADMIN_PASSWORD!, 10);
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.username, ADMIN_USERNAME!));
    console.log("Password updated.");
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD!, 10);
    await db.insert(adminUsers).values({
      username: ADMIN_USERNAME!,
      passwordHash: hash,
    });
    console.log(`Admin user '${ADMIN_USERNAME}' created.`);
  }

  console.log(`\nAdmin username: ${ADMIN_USERNAME}\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
