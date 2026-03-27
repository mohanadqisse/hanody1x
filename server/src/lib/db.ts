import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../schema/index.js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL || "file:sqlite.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
