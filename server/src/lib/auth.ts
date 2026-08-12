import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "portfolio-creator-secret-key-change-in-production";

export function signToken(payload: { id: number; username?: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: number; username?: string; role?: string };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "غير مصرح" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (req as Request & { admin: typeof payload }).admin = payload;
    next();
  } catch {
    res.status(401).json({ message: "رمز غير صالح" });
  }
}

export function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "غير مصرح" });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (req as Request & { user: typeof payload }).user = payload;
    next();
  } catch {
    res.status(401).json({ message: "رمز غير صالح" });
  }
}
