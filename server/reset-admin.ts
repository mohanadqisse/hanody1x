import bcrypt from "bcryptjs";
import { db } from "./src/lib/db.js";
import { adminUsers } from "./src/schema/index.js";
import { eq } from "drizzle-orm";

async function reset() {
  console.log("Resetting admin password...");
  const hash = await bcrypt.hash("Aqaba2025", 10);
  
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin"));
  
  if (existing) {
    await db.update(adminUsers).set({ passwordHash: hash }).where(eq(adminUsers.username, "admin"));
    console.log("Password successfully reset to: Aqaba2025");
  } else {
    await db.insert(adminUsers).values({ username: "admin", passwordHash: hash });
    console.log("Admin user created with password: Aqaba2025");
  }
  process.exit(0);
}

reset();
