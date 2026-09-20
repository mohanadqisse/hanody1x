import { db } from "./src/lib/db.js";
import { adminUsers } from "./src/schema/index.js";

async function run() {
  const users = await db.select().from(adminUsers);
  console.log("USERS IN DB:", users);
  process.exit(0);
}

run();
