import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { portfolioCreators, portfolioItems } from "../schema/index.js";
import { requireAuth } from "../lib/auth.js";
import { eq, asc, and, sql } from "drizzle-orm";

const router = Router();

let tablesEnsured = false;
async function ensurePortfolioTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS portfolio_creators (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_url TEXT,
      subscriber_count TEXT,
      youtube_url TEXT,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS portfolio_items (
      id SERIAL PRIMARY KEY,
      creator_id INTEGER REFERENCES portfolio_creators(id) ON DELETE CASCADE NOT NULL,
      image_url TEXT NOT NULL,
      title TEXT,
      youtube_url TEXT,
      views TEXT,
      category TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`);
    tablesEnsured = true;
  } catch (_e) {}
}

// Ensure tables on each router invocation safely
router.use(async (_req, _res, next) => {
  await ensurePortfolioTables();
  next();
});

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/portfolio/creators
 * Returns all active creators with their active thumbnails, ordered by displayOrder
 */
router.get("/creators", async (_req, res) => {
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

    // Group items by creatorId
    const itemsByCreator = new Map<number, typeof items>();
    for (const item of items) {
      if (!itemsByCreator.has(item.creatorId)) {
        itemsByCreator.set(item.creatorId, []);
      }
      itemsByCreator.get(item.creatorId)!.push(item);
    }

    const result = creators.map((creator) => ({
      ...creator,
      items: itemsByCreator.get(creator.id) || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching public portfolio creators:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/portfolio/items
 * Returns all active portfolio items flattened
 */
router.get("/items", async (_req, res) => {
  try {
    const items = await db
      .select({
        id: portfolioItems.id,
        creatorId: portfolioItems.creatorId,
        creatorName: portfolioCreators.name,
        creatorAvatar: portfolioCreators.avatarUrl,
        imageUrl: portfolioItems.imageUrl,
        title: portfolioItems.title,
        youtubeUrl: portfolioItems.youtubeUrl,
        views: portfolioItems.views,
        category: portfolioItems.category,
        displayOrder: portfolioItems.displayOrder,
        createdAt: portfolioItems.createdAt,
      })
      .from(portfolioItems)
      .innerJoin(portfolioCreators, eq(portfolioItems.creatorId, portfolioCreators.id))
      .where(and(eq(portfolioItems.isActive, true), eq(portfolioCreators.isActive, true)))
      .orderBy(asc(portfolioCreators.displayOrder), asc(portfolioItems.displayOrder));

    res.json(items);
  } catch (err) {
    console.error("Error fetching public portfolio items:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES (Protected by requireAuth)
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/portfolio/admin/creators
 * Returns all creators (including inactive) with their items for the Admin CMS
 */
router.get("/admin/creators", requireAuth, async (_req, res) => {
  try {
    const creators = await db
      .select()
      .from(portfolioCreators)
      .orderBy(asc(portfolioCreators.displayOrder), asc(portfolioCreators.id));

    const items = await db
      .select()
      .from(portfolioItems)
      .orderBy(asc(portfolioItems.displayOrder), asc(portfolioItems.id));

    const itemsByCreator = new Map<number, typeof items>();
    for (const item of items) {
      if (!itemsByCreator.has(item.creatorId)) {
        itemsByCreator.set(item.creatorId, []);
      }
      itemsByCreator.get(item.creatorId)!.push(item);
    }

    const result = creators.map((creator) => ({
      ...creator,
      items: itemsByCreator.get(creator.id) || [],
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching admin portfolio creators:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const creatorSchema = z.object({
  name: z.string().trim().min(1, "Creator name is required"),
  avatarUrl: z.string().trim().optional().nullable(),
  subscriberCount: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/**
 * POST /api/portfolio/admin/creators
 * Create a new creator
 */
router.post("/admin/creators", requireAuth, async (req, res) => {
  try {
    const data = creatorSchema.parse(req.body);

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const [maxRow] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${portfolioCreators.displayOrder}), 0)` })
        .from(portfolioCreators);
      displayOrder = (Number(maxRow?.maxOrder) || 0) + 1;
    }

    const [created] = await db
      .insert(portfolioCreators)
      .values({
        name: data.name,
        avatarUrl: data.avatarUrl || null,
        subscriberCount: data.subscriberCount || null,
        youtubeUrl: data.youtubeUrl || null,
        description: data.description || null,
        displayOrder,
        isActive: data.isActive ?? true,
      })
      .returning();

    res.status(201).json({ ...created, items: [] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0]?.message || "Invalid input data" });
      return;
    }
    console.error("Error creating creator:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const updateCreatorSchema = creatorSchema.partial();

/**
 * PATCH /api/portfolio/admin/creators/:id
 * Update an existing creator
 */
router.patch("/admin/creators/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid creator ID" });
      return;
    }

    const data = updateCreatorSchema.parse(req.body);

    const updateValues: Record<string, any> = { updatedAt: new Date() };
    if (data.name !== undefined) updateValues.name = data.name;
    if (data.avatarUrl !== undefined) updateValues.avatarUrl = data.avatarUrl || null;
    if (data.subscriberCount !== undefined) updateValues.subscriberCount = data.subscriberCount || null;
    if (data.youtubeUrl !== undefined) updateValues.youtubeUrl = data.youtubeUrl || null;
    if (data.description !== undefined) updateValues.description = data.description || null;
    if (data.displayOrder !== undefined) updateValues.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;

    const [updated] = await db
      .update(portfolioCreators)
      .set(updateValues)
      .where(eq(portfolioCreators.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Creator not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0]?.message || "Invalid input data" });
      return;
    }
    console.error("Error updating creator:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/portfolio/admin/creators/:id
 * Delete creator and its associated items
 */
router.delete("/admin/creators/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid creator ID" });
      return;
    }

    await db.delete(portfolioCreators).where(eq(portfolioCreators.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting creator:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/portfolio/admin/creators/reorder
 * Batch update display order for creators
 */
router.put("/admin/creators/reorder", requireAuth, async (req, res) => {
  try {
    const schema = z.object({
      order: z.array(z.object({ id: z.number().int(), displayOrder: z.number().int() })),
    });
    const { order } = schema.parse(req.body);

    for (const item of order) {
      await db
        .update(portfolioCreators)
        .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
        .where(eq(portfolioCreators.id, item.id));
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid reorder payload" });
      return;
    }
    console.error("Error reordering creators:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
// THUMBNAIL (PORTFOLIO ITEM) ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

const itemSchema = z.object({
  imageUrl: z.string().trim().min(1, "Thumbnail image URL is required"),
  title: z.string().trim().optional().nullable(),
  youtubeUrl: z.string().trim().optional().nullable(),
  views: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/**
 * POST /api/portfolio/admin/creators/:creatorId/items
 * Add a thumbnail under a specific creator
 */
router.post("/admin/creators/:creatorId/items", requireAuth, async (req, res) => {
  try {
    const creatorId = parseInt(String(req.params.creatorId), 10);
    if (isNaN(creatorId)) {
      res.status(400).json({ message: "Invalid creator ID" });
      return;
    }

    const data = itemSchema.parse(req.body);

    let displayOrder = data.displayOrder;
    if (displayOrder === undefined) {
      const [maxRow] = await db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${portfolioItems.displayOrder}), 0)` })
        .from(portfolioItems)
        .where(eq(portfolioItems.creatorId, creatorId));
      displayOrder = (Number(maxRow?.maxOrder) || 0) + 1;
    }

    const [created] = await db
      .insert(portfolioItems)
      .values({
        creatorId,
        imageUrl: data.imageUrl,
        title: data.title || null,
        youtubeUrl: data.youtubeUrl || null,
        views: data.views || null,
        category: data.category || null,
        displayOrder,
        isActive: data.isActive ?? true,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0]?.message || "Invalid input data" });
      return;
    }
    console.error("Error creating thumbnail item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

const updateItemSchema = itemSchema.partial();

/**
 * PATCH /api/portfolio/admin/items/:id
 * Update a thumbnail
 */
router.patch("/admin/items/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid item ID" });
      return;
    }

    const data = updateItemSchema.parse(req.body);

    const updateValues: Record<string, any> = { updatedAt: new Date() };
    if (data.imageUrl !== undefined) updateValues.imageUrl = data.imageUrl;
    if (data.title !== undefined) updateValues.title = data.title || null;
    if (data.youtubeUrl !== undefined) updateValues.youtubeUrl = data.youtubeUrl || null;
    if (data.views !== undefined) updateValues.views = data.views || null;
    if (data.category !== undefined) updateValues.category = data.category || null;
    if (data.displayOrder !== undefined) updateValues.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;

    const [updated] = await db
      .update(portfolioItems)
      .set(updateValues)
      .where(eq(portfolioItems.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "Thumbnail not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: err.errors[0]?.message || "Invalid input data" });
      return;
    }
    console.error("Error updating thumbnail item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/portfolio/admin/items/:id
 * Delete a thumbnail
 */
router.delete("/admin/items/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid item ID" });
      return;
    }

    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting thumbnail item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/portfolio/admin/creators/:creatorId/items/reorder
 * Batch update display order for thumbnails belonging to a creator
 */
router.put("/admin/creators/:creatorId/items/reorder", requireAuth, async (req, res) => {
  try {
    const creatorId = parseInt(String(req.params.creatorId), 10);
    if (isNaN(creatorId)) {
      res.status(400).json({ message: "Invalid creator ID" });
      return;
    }

    const schema = z.object({
      order: z.array(z.object({ id: z.number().int(), displayOrder: z.number().int() })),
    });
    const { order } = schema.parse(req.body);

    for (const item of order) {
      await db
        .update(portfolioItems)
        .set({ displayOrder: item.displayOrder, updatedAt: new Date() })
        .where(and(eq(portfolioItems.id, item.id), eq(portfolioItems.creatorId, creatorId)));
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid reorder payload" });
      return;
    }
    console.error("Error reordering thumbnails:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
