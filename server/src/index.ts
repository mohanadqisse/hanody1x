import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import uploadRouter from "./routes/upload.js";
import healthRouter from "./routes/health.js";
import messagesRouter from "./routes/messages.js";
import dashboardRouter from "./routes/dashboard.js";
import userAuthRouter from "./routes/userAuth.js";
import userDashboardRouter from "./routes/userDashboard.js";
import publicRatingsRouter from "./routes/publicRatings.js";
import rateLimit from "express-rate-limit";
import { db } from "./lib/db.js";
import { sql } from "drizzle-orm";

// Safe migration: CREATE TABLE IF NOT EXISTS — never drops data.
// C1/C2 FIX: This function now throws on any fatal error so the server
// does NOT start when the database is unreachable or misconfigured.
async function ensureTables() {
  // C3 FIX: `username` in the `users` table is nullable in the Drizzle schema
  // (some flows create users without a username). The DDL now matches — no NOT NULL.
  // NOTE for live databases: if your existing `users.username` column is NOT NULL,
  // you must run the following migration once manually:
  //   ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
  await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS site_content (id SERIAL PRIMARY KEY, section TEXT NOT NULL, content TEXT NOT NULL DEFAULT '{}', updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS contact_messages (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, service TEXT, message TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS login_logs (id SERIAL PRIMARY KEY, username TEXT NOT NULL, ip_address TEXT, device_info TEXT, success BOOLEAN NOT NULL, attempted_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', balance INTEGER NOT NULL DEFAULT 0, orders_completed INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS time_sessions (id SERIAL PRIMARY KEY, title TEXT NOT NULL DEFAULT 'session', duration_seconds INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  // C3 FIX: username is nullable (TEXT UNIQUE, no NOT NULL) to match the Drizzle schema.
  await db.execute(sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT NOT NULL, full_name TEXT NOT NULL, email TEXT UNIQUE, avatar TEXT, role TEXT NOT NULL DEFAULT 'user', is_banned BOOLEAN NOT NULL DEFAULT FALSE, ban_reason TEXT, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS thumbnails (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), title TEXT NOT NULL, image TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'قيد العمل', download_url TEXT, notes TEXT, price INTEGER NOT NULL DEFAULT 0, creator_name TEXT, youtube_url TEXT, views TEXT, video_title TEXT, category TEXT, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  // NOTE: 'date' phantom column removed — it was never in the Drizzle schema.
  await db.execute(sql`CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, description TEXT NOT NULL, amount INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS creator_codes (id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, thumbnail_id INTEGER REFERENCES thumbnails(id) NOT NULL, author_name TEXT NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS ratings (id SERIAL PRIMARY KEY, thumbnail_id INTEGER REFERENCES thumbnails(id) NOT NULL, user_id INTEGER REFERENCES users(id) NOT NULL, rating INTEGER NOT NULL, comment TEXT, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'system', read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS public_ratings (id SERIAL PRIMARY KEY, portfolio_item_id INTEGER NOT NULL, rating INTEGER NOT NULL, visitor_id TEXT NOT NULL, visitor_name TEXT NOT NULL DEFAULT 'زائر', created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS revision_requests (id SERIAL PRIMARY KEY, thumbnail_id INTEGER REFERENCES thumbnails(id) NOT NULL, user_id INTEGER REFERENCES users(id) NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS conversations (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, subject TEXT NOT NULL DEFAULT 'General', created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS chat_messages (id SERIAL PRIMARY KEY, conversation_id INTEGER REFERENCES conversations(id) NOT NULL, sender_type TEXT NOT NULL DEFAULT 'user', body TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);

  // Safe additive column additions for existing databases
  try { await db.execute(sql`ALTER TABLE public_ratings ADD COLUMN IF NOT EXISTS visitor_name TEXT NOT NULL DEFAULT 'زائر'`); } catch(_e) { /* already exists */ }
  try { await db.execute(sql`ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS creator_name TEXT`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS youtube_url TEXT`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS views TEXT`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS video_title TEXT`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE thumbnails ADD COLUMN IF NOT EXISTS category TEXT`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'system'`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE creator_codes ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE`); } catch(_e) {}
  try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`); } catch(_e) {}

  console.log("Database tables verified (safe migration - no data loss)");

  // Fix 5 — Safe admin seeding: only runs when no admin account exists.
  // Requires ADMIN_USERNAME and ADMIN_PASSWORD env vars on a fresh deployment.
  // Existing production databases with an existing admin are never modified.
  const { adminUsers } = await import("./schema/index.js");
  const bcrypt = (await import("bcryptjs")).default;

  const [anyAdmin] = await db.select({ id: adminUsers.id }).from(adminUsers);
  if (!anyAdmin) {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      // C1/C2 FIX: throw — not catch — so the server refuses to start.
      throw new Error(
        "No admin account exists in the database. " +
        "Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables to seed the initial admin account."
      );
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(adminUsers).values({ username: ADMIN_USERNAME, passwordHash: hash });
    console.log(`Admin account created for: ${ADMIN_USERNAME}`);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Reverse proxy trust configuration for Render/cloud deployments
app.set("trust proxy", 1);

// Conservative security headers: allow cross-origin resource fetching (e.g. uploads/Cloudinary)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ];
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow Vercel preview deployments
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    // Allow custom domain
    if (origin.includes("hanody1x.com")) return callback(null, true);
    // Allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users/auth", userAuthRouter);
app.use("/api/users/dashboard", userDashboardRouter);
app.use("/api/public-ratings", publicRatingsRouter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { message: "عدد طلبات كبير جداً، يرجى المحاولة لاحقاً." },
});
app.use("/api/messages", apiLimiter, messagesRouter);

// Root route for API server
app.get("/", (_req, res) => {
  res.send("API Server is running");
});

// C1/C2 FIX: ensureTables now throws on fatal errors. If it rejects, the
// process exits with a non-zero code before app.listen is ever called.
ensureTables()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // L1 FIX: store the interval reference so it can be cleared on graceful shutdown.
    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

    // Set up an automatic self-ping to keep the server awake on Render free tier.
    const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_EXTERNAL_URL) {
      keepAliveInterval = setInterval(async () => {
        try {
          const res = await fetch(`${RENDER_EXTERNAL_URL}/api/healthz`, {
            headers: {
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
          if (res.ok) {
            console.log(`[Keep-Alive] Self-ping successful: ${RENDER_EXTERNAL_URL}`);
          } else {
            console.error(`[Keep-Alive] Self-ping failed with status: ${res.status}`);
          }
        } catch (error) {
          console.error("[Keep-Alive] Self-ping error:", error);
        }
      }, 8 * 60 * 1000); // Ping every 8 minutes (Render sleeps after 15 mins of inactivity)
    }

    // L1 FIX: clean up on graceful shutdown signals.
    const shutdown = () => {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      server.close(() => process.exit(0));
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  })
  .catch((err) => {
    // C1/C2 FIX: fatal startup error — exit immediately so the platform
    // marks the deploy as failed and alerts the operator.
    console.error("[FATAL] Server failed to start:", err);
    process.exit(1);
  });

export default app;
