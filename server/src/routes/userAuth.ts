import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../lib/db.js";
import { users, creatorCodes } from "../schema/index.js";
import { signToken, requireUserAuth } from "../lib/auth.js";
import { eq, or, and } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  username: z.string().min(3).regex(/^[A-Za-z0-9_]+$/, "Username must not contain spaces or special characters"),
  email: z.string().email(),
  password: z.string().min(6).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  role: z.enum(["user", "guest"]).optional().default("user"),
  inviteCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  role: z.string().optional(),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "Too many attempts. Please try again after 15 minutes." },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many registration attempts. Please try again after 15 minutes." },
});

const guestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many guest login attempts. Please try again after 15 minutes." },
});

router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { fullName, username, email, password, role, inviteCode } = registerSchema.parse(req.body);
    
    // Invite Code validation for Creators
    if (role === "user") {
      if (!inviteCode) {
        res.status(400).json({ message: "Please enter a creator invitation code to create an account" });
        return;
      }
      const [validCode] = await db.select().from(creatorCodes).where(
        and(eq(creatorCodes.code, inviteCode), eq(creatorCodes.isActive, true))
      );
      if (!validCode) {
        res.status(400).json({ message: "Invalid code. Please contact the administrator to request a new code." });
        return;
      }
    }

    // Check if email exists
    const [existingEmail] = await db.select().from(users).where(eq(users.email, email));
    if (existingEmail) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    // Check if username exists
    const [existingUsername] = await db.select().from(users).where(eq(users.username, username));
    if (existingUsername) {
      res.status(400).json({ message: "Username is already taken" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      fullName,
      username,
      email,
      passwordHash: hash,
      role,
    }).returning();

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(
      or(eq(users.email, email), eq(users.username, email))
    );

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ type: "banned", message: user.banReason || "Sorry, your account has been suspended by administration." });
      return;
    }

    if (role && user.role !== role) {
      if (role === "guest") {
        res.status(403).json({ type: "wrong_role", message: "Your credentials belong to a Creator account, not a Guest. Please sign in via the Creator portal." });
      } else {
        res.status(403).json({ type: "wrong_role", message: "Please switch to Guest registration to proceed with your personal account." });
      }
      return;
    }

    const token = signToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Guest Login (Creates a temporary token)
router.post("/guest", guestLimiter, async (req, res) => {
  const token = signToken({ id: 0, role: "guest" });
  res.json({ token, user: { id: 0, fullName: "Demo Guest", email: "guest@example.com", role: "guest", avatar: null } });
});

router.get("/me", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  
  if (payload.role === "guest") {
    res.json({ id: 0, fullName: "Demo Guest", email: "guest@example.com", role: "guest", avatar: null });
    return;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, payload.id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ id: user.id, fullName: user.fullName, username: user.username, email: user.email, role: user.role, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile
router.put("/me", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") {
    res.status(403).json({ message: "Guests are not authorized" });
    return;
  }

  const schema = z.object({
    fullName: z.string().min(2).optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    avatar: z.string().optional().nullable(),
  });

  try {
    const { fullName, password, avatar } = schema.parse(req.body);
    const updates: any = {};
    if (fullName) updates.fullName = fullName;
    if (avatar !== undefined) updates.avatar = avatar || null;
    if (password && password.length >= 6) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, payload.id));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: "Invalid input data" });
  }
});

export default router;
