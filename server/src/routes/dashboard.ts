import { Router } from "express";
import { db } from "../lib/db.js";
import { clients, timeSessions } from "../schema/index.js";
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
