import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "../schema/index.js";
import { eq } from "drizzle-orm";

// Fix 4 — Fail fast if JWT_SECRET is not configured. Never use a hardcoded fallback.
if (!process.env.JWT_SECRET) {
  throw new Error(
    "Missing required environment variable: JWT_SECRET. " +
    "Set it in your .env file or deployment environment before starting the server."
  );
}
const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload: { id: number; username?: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: number; username?: string; role?: string };
}

// Fix 1 — Admin middleware: requires role === "admin" in JWT payload.
// User and guest tokens are explicitly rejected with 403.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload.role !== "admin") {
      res.status(403).json({ message: "Unauthorized — this endpoint is reserved for administrators only" });
      return;
    }
    (req as Request & { admin: typeof payload }).admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Fix 2 — User middleware: verifies JWT then checks live ban status from DB.
// Guest tokens (role: "guest", id: 0) skip the DB check — they have no real user row.
export async function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (payload.role !== "guest") {
      // Verify user still exists and is not banned on every authenticated request.
      // Only the two fields needed — avoids loading or leaking passwordHash.
      const [userRecord] = await db
        .select({ isBanned: users.isBanned, banReason: users.banReason })
        .from(users)
        .where(eq(users.id, payload.id));

      if (!userRecord) {
        res.status(401).json({ message: "User not found or has been removed" });
        return;
      }
      if (userRecord.isBanned) {
        res.status(403).json({
          type: "banned",
          message: userRecord.banReason || "Sorry, your account has been suspended by administration.",
        });
        return;
      }
    }

    (req as Request & { user: typeof payload }).user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Upload middleware: allows admin OR authenticated active non-guest users.
// Guests are rejected with 403. Unauthenticated requests are rejected with 401.
export async function requireUploadAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (payload.role === "admin") {
      (req as Request & { admin: typeof payload }).admin = payload;
      return next();
    }

    if (payload.role === "guest") {
      res.status(403).json({ message: "Guests are not authorized to upload files" });
      return;
    }

    if (payload.role === "user") {
      const [userRecord] = await db
        .select({ isBanned: users.isBanned, banReason: users.banReason })
        .from(users)
        .where(eq(users.id, payload.id));

      if (!userRecord) {
        res.status(401).json({ message: "User not found or has been removed" });
        return;
      }
      if (userRecord.isBanned) {
        res.status(403).json({
          type: "banned",
          message: userRecord.banReason || "Sorry, your account has been suspended by administration.",
        });
        return;
      }

      (req as Request & { user: typeof payload }).user = payload;
      return next();
    }

    res.status(403).json({ message: "Unauthorized" });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
