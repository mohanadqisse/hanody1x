import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const urlWithAuth = process.env.DATABASE_AUTH_TOKEN 
  ? `${process.env.DATABASE_URL}?authToken=${process.env.DATABASE_AUTH_TOKEN}`
  : process.env.DATABASE_URL || "file:./sqlite.db";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: urlWithAuth,
  },
});
