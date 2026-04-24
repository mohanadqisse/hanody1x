import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../lib/db.js";
import { users } from "../schema/index.js";
import { signToken, requireUserAuth } from "../lib/auth.js";
import { eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "محاولات كثيرة جداً، يرجى المحاولة بعد 15 دقيقة." },
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = registerSchema.parse(req.body);
    
    // Check if email exists
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      res.status(400).json({ message: "البريد الإلكتروني مستخدم مسبقاً" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      fullName,
      email,
      passwordHash: hash,
      role: "user",
    }).returning();

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// Guest Login (Creates a temporary token)
router.post("/guest", async (req, res) => {
  const token = signToken({ id: 0, role: "guest" });
  res.json({ token, user: { id: 0, fullName: "زائر ديمو", email: "guest@example.com", role: "guest", avatar: null } });
});

router.get("/me", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  
  if (payload.role === "guest") {
    res.json({ id: 0, fullName: "زائر ديمو", email: "guest@example.com", role: "guest", avatar: null });
    return;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, payload.id));
    if (!user) {
      res.status(404).json({ message: "المستخدم غير موجود" });
      return;
    }
    res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// Update Profile
router.put("/me", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") {
    res.status(403).json({ message: "غير مصرح للزوار" });
    return;
  }

  const schema = z.object({
    fullName: z.string().min(2).optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    avatar: z.string().optional(),
  });

  try {
    const { fullName, password, avatar } = schema.parse(req.body);
    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (avatar) updates.avatar = avatar;
    if (password && password.length >= 6) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, payload.id));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "بيانات غير صالحة" });
  }
});

export default router;
