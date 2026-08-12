import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../lib/db.js";
import { adminUsers, loginLogs } from "../schema/index.js";
import { signToken, requireAuth } from "../lib/auth.js";
import { eq, desc } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { message: "محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة." },
});

router.post("/login", loginLimiter, async (req, res) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const proxyIp = typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : undefined;
  const ipAddress = proxyIp || req.ip || req.socket.remoteAddress || "unknown";
  const deviceInfo = req.headers["user-agent"] || "unknown";
  try {
    const { username, password } = loginSchema.parse(req.body);
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));

    if (!user) {
      await db.insert(loginLogs).values({ username, ipAddress, deviceInfo, success: false, attemptedAt: new Date() });
      res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await db.insert(loginLogs).values({ username, ipAddress, deviceInfo, success: false, attemptedAt: new Date() });
      res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    await db.insert(loginLogs).values({ username, ipAddress, deviceInfo, success: true, attemptedAt: new Date() });
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

router.get("/me", requireAuth, (req, res) => {
  const admin = (req as typeof req & { admin: { id: number; username: string } }).admin;
  res.json({ id: admin.id, username: admin.username });
});

router.get("/logs", requireAuth, async (req, res) => {
  try {
    const logs = await db.select().from(loginLogs).orderBy(desc(loginLogs.attemptedAt)).limit(100);
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({ message: "فشل في جلب سجلات الدخول" });
  }
});

router.delete("/logs/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "معرف غير صالح" });
      return;
    }
    await db.delete(loginLogs).where(eq(loginLogs.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete log:", err);
    res.status(500).json({ message: "فشل في حذف السجل" });
  }
});

export default router;
