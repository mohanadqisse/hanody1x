import { Router } from "express";
import { db } from "../lib/db.js";
import { clients, timeSessions, users, thumbnails, transactions, comments, ratings, notifications } from "../schema/index.js";
import { eq, desc, sum, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(requireAuth);

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
    const { title, image, status, notes, downloadUrl } = req.body;
    const [updated] = await db.update(thumbnails).set({
      ...(title !== undefined && { title }),
      ...(image !== undefined && { image }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(downloadUrl !== undefined && { downloadUrl }),
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
    const { userId, title, image, status, notes, downloadUrl } = req.body;
    const [newThumb] = await db.insert(thumbnails).values({
      userId: parseInt(userId),
      title,
      image,
      status: status || "قيد العمل",
      notes,
      downloadUrl
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

export default router;
