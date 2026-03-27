import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { siteContent } from "../schema/index.js";
import { requireAuth } from "../lib/auth.js";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");

const router = Router();

router.get("/all", requireAuth, async (_req, res) => {
  try {
    const rows = await db.select().from(siteContent);
    const result: Record<string, Record<string, string>> = {};
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

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get("/images", async (_req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "portfolio",
      max_results: 100,
    });
    const files = result.resources.map((file: any) => file.secure_url || file.url);
    res.json(files);
  } catch (err) {
    console.error("Cloudinary fetch error:", err);
    res.json([]);
  }
});

router.get("/:section", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, req.params.section as string));
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

router.put("/:section", requireAuth, async (req, res) => {
  try {
    const { content } = updateSchema.parse(req.body);
    const section = req.params.section as string;

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

export default router;
