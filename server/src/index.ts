import express from "express";
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

// Safe migration: CREATE TABLE IF NOT EXISTS - never drops data
async function ensureTables() {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_users (id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS site_content (id SERIAL PRIMARY KEY, section TEXT NOT NULL, content TEXT NOT NULL DEFAULT '{}', updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS contact_messages (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, service TEXT, message TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS login_logs (id SERIAL PRIMARY KEY, username TEXT NOT NULL, ip_address TEXT, device_info TEXT, success BOOLEAN NOT NULL, attempted_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS clients (id SERIAL PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', balance INTEGER NOT NULL DEFAULT 0, orders_completed INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS time_sessions (id SERIAL PRIMARY KEY, title TEXT NOT NULL DEFAULT 'session', duration_seconds INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, full_name TEXT NOT NULL, email TEXT, avatar TEXT, role TEXT NOT NULL DEFAULT 'user', created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS thumbnails (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), title TEXT NOT NULL, image TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', download_url TEXT, notes TEXT, price INTEGER, created_at TIMESTAMP DEFAULT NOW() NOT NULL, updated_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, description TEXT NOT NULL, amount INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', date TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS creator_codes (id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL, email TEXT, used BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, thumbnail_id INTEGER REFERENCES thumbnails(id) NOT NULL, author_name TEXT NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS ratings (id SERIAL PRIMARY KEY, thumbnail_id INTEGER REFERENCES thumbnails(id) NOT NULL, user_id INTEGER REFERENCES users(id) NOT NULL, rating INTEGER NOT NULL, comment TEXT, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) NOT NULL, message TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS public_ratings (id SERIAL PRIMARY KEY, portfolio_item_id INTEGER NOT NULL, rating INTEGER NOT NULL, visitor_id TEXT NOT NULL, visitor_name TEXT NOT NULL DEFAULT 'زائر', created_at TIMESTAMP DEFAULT NOW() NOT NULL)`);
    // Add visitor_name column if it doesn't exist (safe migration)
    try { await db.execute(sql`ALTER TABLE public_ratings ADD COLUMN IF NOT EXISTS visitor_name TEXT NOT NULL DEFAULT 'زائر'`); } catch(e) { /* column may already exist */ }
    // Clear all existing ratings as requested
    await db.execute(sql`DELETE FROM public_ratings`);
    console.log("Database tables verified (safe migration - no data loss)");

    // Auto-seed admin if it doesn't exist
    const { adminUsers } = await import("./schema/index.js");
    const { eq } = await import("drizzle-orm");
    const bcrypt = (await import("bcryptjs")).default;
    
    const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    
    const [existingAdmin] = await db.select().from(adminUsers).where(eq(adminUsers.username, DEFAULT_USERNAME));
    if (!existingAdmin) {
      const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      await db.insert(adminUsers).values({ username: DEFAULT_USERNAME, passwordHash: hash });
      console.log(`Auto-seeded admin user: ${DEFAULT_USERNAME}`);
    }
  } catch (err) {
    console.error("Database table check error:", err);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

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

// Start server with safe migration
ensureTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);

  // Set up an automatic self-ping mechanism to keep the server awake on Render free tier
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_EXTERNAL_URL) {
    setInterval(async () => {
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
    }, 8 * 60 * 1000); // Trigger every 8 minutes (Render sleeps after 15 mins)
  }
  });
});

export default app;
