import { Router } from "express";
import { db } from "../lib/db.js";
import { clients, timeSessions, users, thumbnails, transactions, comments, ratings, notifications, creatorCodes } from "../schema/index.js";
import { eq, desc, sum, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import bcrypt from "bcryptjs";

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(requireAuth);

// =======================
// Creator Invite Codes Management
// =======================
router.get("/codes", async (req, res) => {
  try {
    const codes = await db.select().from(creatorCodes).orderBy(desc(creatorCodes.createdAt));
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/codes", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    // Check if code already exists
    const existing = await db.select().from(creatorCodes).where(eq(creatorCodes.code, code));
    if (existing.length > 0) return res.status(400).json({ error: "Code already exists" });

    const [newCode] = await db.insert(creatorCodes).values({ code, isActive: true }).returning();
    res.status(201).json(newCode);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/codes/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existingCode] = await db.select().from(creatorCodes).where(eq(creatorCodes.id, id));
    if (!existingCode) return res.status(404).json({ error: "Code not found" });

    const [updatedCode] = await db.update(creatorCodes).set({ isActive: !existingCode.isActive }).where(eq(creatorCodes.id, id)).returning();
    res.json(updatedCode);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/codes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(creatorCodes).where(eq(creatorCodes.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Dashboard Stats
// =======================
router.get("/stats", async (req, res) => {
  try {
    const clientsData = await db.select().from(clients);
    
    let totalRevenue = 0;
    let totalDues = 0;
    let totalOrders = 0;
    
    clientsData.forEach(client => {
      totalOrders += client.ordersCompleted;
      totalDues += client.balance;
      // Let's assume totalRevenue is previously paid plus current dues for now,
      // or we can just say totalDues is unpaid, totalRevenue is some calculated sum.
      // For exactly matching the image showing 0 for both if new.
    });

    res.json({
      totalRevenue: 0, // Placeholder, can be calculated based on paid invoices if added later
      totalDues,
      totalClients: clientsData.length,
      completedOrders: totalOrders
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Clients
// =======================
router.get("/clients", async (req, res) => {
  try {
    const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));
    res.json(allClients);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const { name, status = "جديد" } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const [newClient] = await db.insert(clients).values({
      name,
      status,
      balance: 0,
      ordersCompleted: 0
    }).returning();
    
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/clients/:id/work", async (req, res) => {
  // This endpoint bumps the photo limit and adds to balance ($10 default per picture)
  try {
    const clientId = parseInt(req.params.id);
    const { amount = 10, items = 1 } = req.body; // e.g. price per pic
    
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    const [updatedClient] = await db.update(clients).set({
      balance: client.balance + (amount * items),
      ordersCompleted: client.ordersCompleted + items,
      updatedAt: new Date()
    }).where(eq(clients.id, clientId)).returning();

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/clients/:id/clear", async (req, res) => {
  // Clear the balance to 0
  try {
    const clientId = parseInt(req.params.id);
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    const [updatedClient] = await db.update(clients).set({
      balance: 0,
      updatedAt: new Date()
    }).where(eq(clients.id, clientId)).returning();

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/clients/:id/set-orders", async (req, res) => {
  // Manually set the number of completed orders
  try {
    const clientId = parseInt(req.params.id);
    const { ordersCompleted } = req.body;
    
    if (ordersCompleted === undefined || isNaN(parseInt(ordersCompleted))) {
        return res.status(400).json({ error: "ordersCompleted is required" });
    }

    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    const [updatedClient] = await db.update(clients).set({
      ordersCompleted: parseInt(ordersCompleted),
      updatedAt: new Date()
    }).where(eq(clients.id, clientId)).returning();

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    await db.delete(clients).where(eq(clients.id, clientId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Platform Users Management
// =======================
router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete related data first
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(transactions).where(eq(transactions.userId, userId));
    
    const userThumbs = await db.select({ id: thumbnails.id }).from(thumbnails).where(eq(thumbnails.userId, userId));
    for (const thumb of userThumbs) {
      await db.delete(comments).where(eq(comments.thumbnailId, thumb.id));
      await db.delete(ratings).where(eq(ratings.thumbnailId, thumb.id));
    }
    await db.delete(ratings).where(eq(ratings.userId, userId));
    await db.delete(thumbnails).where(eq(thumbnails.userId, userId));

    // Finally delete user
    await db.delete(users).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/users/:id/ban", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isBanned, banReason } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const [updatedUser] = await db.update(users).set({
      isBanned: isBanned,
      banReason: isBanned ? banReason : null
    }).where(eq(users.id, userId)).returning();

    res.json(updatedUser);
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Admin - Creator Management Endpoints
// =======================
router.get("/users/:id/thumbnails", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userThumbnails = await db.select().from(thumbnails).where(eq(thumbnails.userId, userId)).orderBy(desc(thumbnails.createdAt));
    res.json(userThumbnails);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:id/transactions", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
    res.json(userTransactions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/thumbnails/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, image, status, notes, downloadUrl, price } = req.body;
    const [updated] = await db.update(thumbnails).set({
      ...(title !== undefined && { title }),
      ...(image !== undefined && { image }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(downloadUrl !== undefined && { downloadUrl }),
      ...(price !== undefined && { price: parseInt(price) || 0 }),
    }).where(eq(thumbnails.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/thumbnails/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(thumbnails).where(eq(thumbnails.id, id));
    res.json({ message: "Thumbnail deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/transactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { description, amount, status } = req.body;
    const [updated] = await db.update(transactions).set({
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount }),
      ...(status !== undefined && { status }),
    }).where(eq(transactions.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(transactions).where(eq(transactions.id, id));
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/thumbnails", async (req, res) => {
  try {
    const { userId, title, image, status, notes, downloadUrl, price } = req.body;
    const [newThumb] = await db.insert(thumbnails).values({
      userId: parseInt(userId),
      title,
      image,
      status: status || "قيد العمل",
      notes,
      downloadUrl,
      price: price ? parseInt(price) : 0
    }).returning();
    res.status(201).json(newThumb);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/transactions", async (req, res) => {
  try {
    const { userId, description, amount, status } = req.body;
    const [newTrans] = await db.insert(transactions).values({
      userId: parseInt(userId),
      description,
      amount: parseInt(amount),
      status: status || "pending"
    }).returning();
    res.status(201).json(newTrans);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/transactions/:id/pay", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(transactions).set({ status: "paid" }).where(eq(transactions.id, id)).returning();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Time Sessions
// =======================
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await db.select().from(timeSessions).orderBy(desc(timeSessions.createdAt)).limit(10);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/sessions", async (req, res) => {
  try {
    const { title, durationSeconds } = req.body;
    if (typeof durationSeconds !== 'number') {
      return res.status(400).json({ error: "Duration is required" });
    }

    const [newSession] = await db.insert(timeSessions).values({
      title: title || "جلسة عمل بدون اسم",
      durationSeconds
    }).returning();
    
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Notifications Management
router.get("/users/:id/notifications", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userNotifs = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    res.json(userNotifs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const { userId, message } = req.body;
    const [newNotif] = await db.insert(notifications).values({
      userId: parseInt(userId),
      message
    }).returning();
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/notifications/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(notifications).where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Settings Management
router.patch("/users/:id/settings", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { fullName, avatar, password } = req.body;
    
    let updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// --- Admin: View Comments & Ratings for a user ---
router.get("/users/:id/comments", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userThumbs = await db.select().from(thumbnails).where(eq(thumbnails.userId, userId));
    const thumbIds = userThumbs.map(t => t.id);
    if (thumbIds.length === 0) { res.json([]); return; }
    
    const allComments: any[] = [];
    for (const tid of thumbIds) {
      const tc = await db.select().from(comments).where(eq(comments.thumbnailId, tid)).orderBy(desc(comments.createdAt));
      const thumb = userThumbs.find(t => t.id === tid);
      tc.forEach(c => allComments.push({ ...c, thumbnailTitle: thumb?.title || "" }));
    }
    res.json(allComments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:id/ratings", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userThumbs = await db.select().from(thumbnails).where(eq(thumbnails.userId, userId));
    const thumbIds = userThumbs.map(t => t.id);
    if (thumbIds.length === 0) { res.json([]); return; }
    
    const allRatings: any[] = [];
    for (const tid of thumbIds) {
      const tr = await db.select().from(ratings).where(eq(ratings.thumbnailId, tid));
      const thumb = userThumbs.find(t => t.id === tid);
      tr.forEach(r => allRatings.push({ ...r, thumbnailTitle: thumb?.title || "" }));
    }
    res.json(allRatings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Admin reply to a comment on a thumbnail
router.post("/thumbnails/:id/comments", async (req, res) => {
  try {
    const thumbnailId = parseInt(req.params.id);
    const { content } = req.body;
    const [newComment] = await db.insert(comments).values({
      thumbnailId,
      authorName: "المدير",
      isAdmin: true,
      content
    }).returning();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
