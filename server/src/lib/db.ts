import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/index.js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL || "";

if (!url) {
  throw new Error("DATABASE_URL is missing in .env");
}

const client = postgres(url);
export const db = drizzle(client, { schema });
