import bcrypt from "bcryptjs";
import { db } from "./lib/db.js";
import { adminUsers } from "./schema/index.js";
import { eq } from "drizzle-orm";

const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function seed() {
  console.log("Starting database seed...");

  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, DEFAULT_USERNAME));

  if (existing) {
    console.log(`Admin user '${DEFAULT_USERNAME}' already exists.`);
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.username, DEFAULT_USERNAME));
    console.log("Password updated.");
  } else {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await db.insert(adminUsers).values({
      username: DEFAULT_USERNAME,
      passwordHash: hash,
    });
    console.log(`Admin user '${DEFAULT_USERNAME}' created.`);
  }

  console.log(`\nLogin credentials:\n  Username: ${DEFAULT_USERNAME}\n  Password: ${DEFAULT_PASSWORD}\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
