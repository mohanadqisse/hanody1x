import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { publicRatings } from "../schema/index.js";
import { requireAuth } from "../lib/auth.js";
import { and, desc, eq } from "drizzle-orm";
import rateLimit from "express-rate-limit";

const router = Router();

// H2 FIX: rate-limit the unauthenticated public ratings POST to prevent vote spam.
const publicRatingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many requests. Please try again shortly." },
});

const ratingSchema = z.object({
  portfolioItemId: z.number(),
  rating: z.number().min(1).max(5),
  // H1 FIX: bound visitorId and visitorName to prevent column flooding.
  visitorId: z.string().min(1).max(128),
  visitorName: z.string().min(1, "Please enter your name").max(100),
});

router.post("/", publicRatingLimiter, async (req, res) => {
  try {
    const { portfolioItemId, rating, visitorId, visitorName } = ratingSchema.parse(req.body);

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
        .set({ rating, visitorName, createdAt: new Date() })
        .where(eq(publicRatings.id, existing.id));
    } else {
      await db.insert(publicRatings).values({ portfolioItemId, rating, visitorId, visitorName });
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }
    console.error("Public rating error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const ratings = await db.select().from(publicRatings).orderBy(desc(publicRatings.createdAt));
    res.json(ratings);
  } catch (err) {
    console.error("Fetch public ratings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a single rating by ID
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    await db.delete(publicRatings).where(eq(publicRatings.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete public rating error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete all ratings for a specific visitor
router.delete("/visitor/:visitorName", requireAuth, async (req, res) => {
  try {
    const visitorName = decodeURIComponent(req.params.visitorName as string);
    await db.delete(publicRatings).where(eq(publicRatings.visitorName, visitorName));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete visitor ratings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
