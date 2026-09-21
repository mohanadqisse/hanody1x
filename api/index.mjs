// Vercel Serverless Function — wraps the Express app
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql, eq, and, asc } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

dotenv.config();

// ─── Schema (mirrors server/src/schema/index.ts) ────────
const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const siteContent = sqliteTable("site_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  content: text("content").notNull().default("{}"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  service: text("service"),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const portfolioCreators = sqliteTable("portfolio_creators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  subscriberCount: text("subscriber_count"),
  youtubeUrl: text("youtube_url"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const portfolioItems = sqliteTable("portfolio_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorId: integer("creator_id").notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  youtubeUrl: text("youtube_url"),
  views: text("views"),
  category: text("category"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const schema = { adminUsers, siteContent, contactMessages, portfolioCreators, portfolioItems };

// ─── Database ────────────────────────────────────────────
const url = process.env.DATABASE_URL || "file:sqlite.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

// ─── Auth Helpers (Bearer token) ─────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "portfolio-creator-secret-key-change-in-production";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ─── Cloudinary ──────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "portfolio",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ─── Express App ─────────────────────────────────────────
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Route ────────────────────────────────────────
const healthRouter = Router();
healthRouter.get("/health", async (_req, res) => {
  try {
    const [row] = await db.select().from(siteContent).limit(1);
    res.json({ status: "ok", db: "connected", sample: !!row });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

// ─── Auth Routes ─────────────────────────────────────────
const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));

    if (!user) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    const token = signToken({ id: user.id, username: user.username });
    res.json({ token, username: user.username });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ id: req.admin.id, username: req.admin.username });
});

// ─── Content Routes ──────────────────────────────────────
const contentRouter = Router();

contentRouter.get("/all", requireAuth, async (_req, res) => {
  try {
    const rows = await db.select().from(siteContent);
    const result = {};
    for (const row of rows) {
      try {
        result[row.section] = JSON.parse(row.content);
      } catch {
        result[row.section] = {};
      }
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

contentRouter.get("/images", (_req, res) => {
  // On Vercel there's no local uploads folder — return empty
  res.json([]);
});

contentRouter.get("/:section", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, req.params.section));
    if (!row) {
      res.json({});
      return;
    }
    try {
      res.json(JSON.parse(row.content));
    } catch {
      res.json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const updateSchema = z.object({ content: z.string() });

contentRouter.put("/:section", requireAuth, async (req, res) => {
  try {
    const { content } = updateSchema.parse(req.body);
    const section = req.params.section;

    const [existing] = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, section));

    if (existing) {
      await db
        .update(siteContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(siteContent.section, section));
    } else {
      await db.insert(siteContent).values({ section, content });
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Upload Route ────────────────────────────────────────
const uploadRouter = Router();
uploadRouter.post("/", requireAuth, (req, res, _next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Cloudinary Upload Error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "File size exceeds 10 MB limit" });
          return;
        }
        res.status(400).json({ message: `Upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ message: err.message || "File upload error" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file was uploaded" });
      return;
    }
    res.json({ url: req.file.path });
  });
});

// ─── Messages Routes ─────────────────────────────────────
const messagesRouter = Router();

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  packageType: z.string().optional(),
  details: z.string().min(1),
});

messagesRouter.post("/", async (req, res) => {
  try {
    const data = messageSchema.parse(req.body);
    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      service: data.packageType || null,
      message: data.details,
    });
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

messagesRouter.get("/", requireAuth, async (_req, res) => {
  try {
    const msgs = await db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

messagesRouter.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const id = z.coerce.number().parse(req.params.id);
    await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

messagesRouter.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = z.coerce.number().parse(req.params.id);
    await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Portfolio Routes ────────────────────────────────────
const portfolioRouter = Router();

portfolioRouter.get("/creators", async (_req, res) => {
  try {
    const creators = await db
      .select()
      .from(portfolioCreators)
      .where(eq(portfolioCreators.isActive, true))
      .orderBy(asc(portfolioCreators.displayOrder), asc(portfolioCreators.id));

    const items = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.displayOrder), asc(portfolioItems.id));

    const itemsByCreator = new Map();
    for (const item of items) {
      if (!itemsByCreator.has(item.creatorId)) {
        itemsByCreator.set(item.creatorId, []);
      }
      itemsByCreator.get(item.creatorId).push(item);
    }

    const result = creators.map((c) => ({
      ...c,
      items: itemsByCreator.get(c.id) || [],
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.get("/items", async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.displayOrder), asc(portfolioItems.id));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.get("/admin/creators", requireAuth, async (_req, res) => {
  try {
    const creators = await db
      .select()
      .from(portfolioCreators)
      .orderBy(asc(portfolioCreators.displayOrder), asc(portfolioCreators.id));

    const items = await db
      .select()
      .from(portfolioItems)
      .orderBy(asc(portfolioItems.displayOrder), asc(portfolioItems.id));

    const itemsByCreator = new Map();
    for (const item of items) {
      if (!itemsByCreator.has(item.creatorId)) {
        itemsByCreator.set(item.creatorId, []);
      }
      itemsByCreator.get(item.creatorId).push(item);
    }

    const result = creators.map((c) => ({
      ...c,
      items: itemsByCreator.get(c.id) || [],
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.post("/admin/creators", requireAuth, async (req, res) => {
  try {
    const { name, avatarUrl, subscriberCount, youtubeUrl, description, displayOrder, isActive } = req.body;
    if (!name) return res.status(400).json({ message: "Creator name is required" });

    const [created] = await db
      .insert(portfolioCreators)
      .values({
        name,
        avatarUrl: avatarUrl || null,
        subscriberCount: subscriberCount || null,
        youtubeUrl: youtubeUrl || null,
        description: description || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== false,
      })
      .returning();
    res.status(201).json({ ...created, items: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.patch("/admin/creators/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = { ...req.body, updatedAt: new Date() };
    const [updated] = await db
      .update(portfolioCreators)
      .set(updates)
      .where(eq(portfolioCreators.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.delete("/admin/creators/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(portfolioItems).where(eq(portfolioItems.creatorId, id));
    await db.delete(portfolioCreators).where(eq(portfolioCreators.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.post("/admin/creators/:creatorId/items", requireAuth, async (req, res) => {
  try {
    const creatorId = parseInt(req.params.creatorId, 10);
    const { imageUrl, title, youtubeUrl, views, category, displayOrder, isActive } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "Thumbnail image URL is required" });

    const [created] = await db
      .insert(portfolioItems)
      .values({
        creatorId,
        imageUrl,
        title: title || null,
        youtubeUrl: youtubeUrl || null,
        views: views || null,
        category: category || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== false,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.patch("/admin/items/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = { ...req.body, updatedAt: new Date() };
    const [updated] = await db
      .update(portfolioItems)
      .set(updates)
      .where(eq(portfolioItems.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.delete("/admin/items/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.put("/admin/creators/reorder", requireAuth, async (req, res) => {
  try {
    const { order } = req.body;
    if (Array.isArray(order)) {
      for (const item of order) {
        await db
          .update(portfolioCreators)
          .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
          .where(eq(portfolioCreators.id, item.id));
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

portfolioRouter.put("/admin/creators/:creatorId/items/reorder", requireAuth, async (req, res) => {
  try {
    const { order } = req.body;
    if (Array.isArray(order)) {
      for (const item of order) {
        await db
          .update(portfolioItems)
          .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
          .where(eq(portfolioItems.id, item.id));
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Mount Routes ────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please try again later." },
});

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/messages", apiLimiter, messagesRouter);
app.use("/api/portfolio", portfolioRouter);

export default app;
