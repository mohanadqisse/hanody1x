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
import { sql, eq } from "drizzle-orm";
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

const schema = { adminUsers, siteContent, contactMessages };

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
    res.status(401).json({ message: "غير مصرح" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "رمز غير صالح" });
  }
}

// ─── Cloudinary ──────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const extension = file.originalname.split(".").pop();
    return {
      folder: "portfolio",
      format: extension,
      public_id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Express App ─────────────────────────────────────────
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Route ────────────────────────────────────────
const healthRouter = Router();
healthRouter.get("/health", (_req, res) => res.json({ status: "ok" }));
healthRouter.get("/healthz", (_req, res) => res.json({ status: "ok" }));

// ─── Auth Routes ─────────────────────────────────────────
const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة." },
});

authRouter.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));

    if (!user) {
      res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    const token = signToken({ id: user.id, username: user.username });
    res.json({ token, username: user.username });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
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
    res.status(500).json({ message: "خطأ في الخادم" });
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
    res.status(500).json({ message: "خطأ في الخادم" });
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
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
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
          res.status(400).json({ message: "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" });
          return;
        }
        res.status(400).json({ message: `خطأ في رفع الملف: ${err.message}` });
        return;
      }
      res.status(400).json({ message: err.message || "خطأ في رفع الملف" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "لم يتم تحميل أي ملف" });
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
    res.json({ success: true, message: "تم إرسال الرسالة بنجاح" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
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
    res.status(500).json({ message: "خطأ في الخادم" });
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
    res.status(500).json({ message: "خطأ في الخادم" });
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
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// ─── Mount Routes ────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "عدد طلبات كبير جداً، يرجى المحاولة لاحقاً." },
});

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/messages", apiLimiter, messagesRouter);

export default app;
