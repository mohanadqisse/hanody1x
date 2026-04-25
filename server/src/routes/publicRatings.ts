import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { publicRatings } from "../schema/index.js";
import { requireAuth } from "../lib/auth.js";
import { and, desc, eq } from "drizzle-orm";

const router = Router();

const ratingSchema = z.object({
  portfolioItemId: z.number(),
  rating: z.number().min(1).max(5),
  visitorId: z.string(),
});

router.post("/", async (req, res) => {
  try {
    const { portfolioItemId, rating, visitorId } = ratingSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(publicRatings)
      .where(
        and(
          eq(publicRatings.portfolioItemId, portfolioItemId),
          eq(publicRatings.visitorId, visitorId)
        )
      );

    if (existing) {
      await db
        .update(publicRatings)
        .set({ rating, createdAt: new Date() })
        .where(eq(publicRatings.id, existing.id));
    } else {
      await db.insert(publicRatings).values({ portfolioItemId, rating, visitorId });
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error("Public rating error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const ratings = await db.select().from(publicRatings).orderBy(desc(publicRatings.createdAt));
    res.json(ratings);
  } catch (err) {
    console.error("Fetch public ratings error:", err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
