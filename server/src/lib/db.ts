import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/index.js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL || "";

if (!url) {
  throw new Error("DATABASE_URL is missing in .env");
}

// Conservative pool settings for free-tier PostgreSQL providers (Supabase/Neon
// cap at 5-15 simultaneous connections). idle_timeout and connect_timeout
// prevent hung connections from exhausting the pool under load.
const client = postgres(url, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
