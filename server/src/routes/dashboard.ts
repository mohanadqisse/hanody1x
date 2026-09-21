import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { clients, timeSessions, users, thumbnails, transactions, comments, ratings, notifications, creatorCodes, revisionRequests, conversations, chatMessages } from "../schema/index.js";
import { eq, desc, sum, count } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import bcrypt from "bcryptjs";
import { createNotification } from "./userDashboard.js";

// =======================
// Validation Schemas
// =======================

const createCodeSchema = z.object({
  code: z.string().trim().min(1, "الكود مطلوب").max(50, "الكود طويل جداً"),
});

const createClientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  status: z.string().trim().max(50).optional().default("جديد"),
});

const clientWorkSchema = z.object({
  amount: z.coerce.number().int().min(0).max(1000000).optional().default(10),
  items: z.coerce.number().int().min(1).max(10000).optional().default(1),
});

const setOrdersSchema = z.object({
  ordersCompleted: z.coerce.number().int().min(0).max(1000000),
});

const banUserSchema = z.object({
  isBanned: z.boolean(),
  banReason: z.string().trim().max(500).optional().nullable(),
});

const userSettingsSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  avatar: z.string().trim().max(1000).optional().nullable(),
  password: z.string().min(6).max(128).optional().or(z.literal("")),
});

const createThumbnailSchema = z.object({
  userId: z.coerce.number().int().positive("معرف المستخدم مطلوب"),
  title: z.string().trim().max(200).optional().default("Untitled"),
  image: z.string().trim().min(1, "رابط الصورة مطلوب").max(2000),
  status: z.string().trim().max(50).optional().default("قيد العمل"),
  notes: z.string().trim().max(2000).optional().nullable(),
  downloadUrl: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().int().min(0).max(10000000).optional().default(0),
  creatorName: z.string().trim().max(100).optional().nullable(),
  youtubeUrl: z.string().trim().max(1000).optional().nullable(),
  views: z.string().trim().max(50).optional().nullable(),
  videoTitle: z.string().trim().max(300).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
});

const updateThumbnailSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  image: z.string().trim().min(1).max(2000).optional(),
  status: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  downloadUrl: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().int().min(0).max(10000000).optional(),
  creatorName: z.string().trim().max(100).optional().nullable(),
  youtubeUrl: z.string().trim().max(1000).optional().nullable(),
  views: z.string().trim().max(50).optional().nullable(),
  videoTitle: z.string().trim().max(300).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
});

const createTransactionSchema = z.object({
  userId: z.coerce.number().int().positive("معرف المستخدم مطلوب"),
  description: z.string().trim().min(1, "الوصف مطلوب").max(500),
  amount: z.coerce.number().int().min(-10000000).max(10000000),
  status: z.string().trim().max(50).optional().default("pending"),
});

const updateTransactionSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  amount: z.coerce.number().int().min(-10000000).max(10000000).optional(),
  status: z.string().trim().max(50).optional(),
});

const createSessionSchema = z.object({
  title: z.string().trim().max(200).optional().default("جلسة عمل بدون اسم"),
  durationSeconds: z.coerce.number().int().min(0).max(86400 * 365),
});

const createNotificationAdminSchema = z.object({
  userId: z.coerce.number().int().positive("معرف المستخدم مطلوب"),
  message: z.string().trim().min(1, "نص الإشعار مطلوب").max(1000),
  type: z.enum(["system", "thumbnail", "comment", "revision", "message", "billing"]).optional().default("system"),
});

const adminCommentSchema = z.object({
  content: z.string().trim().min(1, "محتوى التعليق مطلوب").max(5000),
});

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
    const { code } = createCodeSchema.parse(req.body);

    // Check if code already exists
    const existing = await db.select().from(creatorCodes).where(eq(creatorCodes.code, code));
    if (existing.length > 0) return res.status(400).json({ error: "Code already exists" });

    const [newCode] = await db.insert(creatorCodes).values({ code, isActive: true }).returning();
    res.status(201).json(newCode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/codes/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
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
    const { name, status } = createClientSchema.parse(req.body);

    const [newClient] = await db.insert(clients).values({
      name,
      status,
      balance: 0,
      ordersCompleted: 0
    }).returning();
    
    res.status(201).json(newClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/clients/:id/work", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) return res.status(400).json({ error: "Invalid client ID" });
    const { amount, items } = clientWorkSchema.parse(req.body);
    
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    const [updatedClient] = await db.update(clients).set({
      balance: client.balance + (amount * items),
      ordersCompleted: client.ordersCompleted + items,
      updatedAt: new Date()
    }).where(eq(clients.id, clientId)).returning();

    res.json(updatedClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/clients/:id/clear", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) return res.status(400).json({ error: "Invalid client ID" });
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
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) return res.status(400).json({ error: "Invalid client ID" });
    const { ordersCompleted } = setOrdersSchema.parse(req.body);

    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Client not found" });

    const [updatedClient] = await db.update(clients).set({
      ordersCompleted,
      updatedAt: new Date()
    }).where(eq(clients.id, clientId)).returning();

    res.json(updatedClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) return res.status(400).json({ error: "Invalid client ID" });
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
router.get("/users", async (_req, res) => {
  try {
    // Fix 3 — Explicit field projection: never return passwordHash to the client.
    const allUsers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        username: users.username,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
        isBanned: users.isBanned,
        banReason: users.banReason,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
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
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    const { isBanned, banReason } = banUserSchema.parse(req.body);
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const [updatedUser] = await db.update(users).set({
      isBanned: isBanned,
      banReason: isBanned ? banReason : null
    }).where(eq(users.id, userId)).returning();

    // Fix 3 — Strip passwordHash before sending the updated user row.
    const { passwordHash: _omit1, ...safeUpdatedUser } = updatedUser;
    res.json(safeUpdatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
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
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    const userThumbnails = await db.select().from(thumbnails).where(eq(thumbnails.userId, userId)).orderBy(desc(thumbnails.createdAt));
    res.json(userThumbnails);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:id/transactions", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
    res.json(userTransactions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/thumbnails", async (_req, res) => {
  try {
    const all = await db.select().from(thumbnails).orderBy(desc(thumbnails.createdAt));
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/thumbnails/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid thumbnail ID" });
    const parsed = updateThumbnailSchema.parse(req.body);

    const [existing] = await db.select({ id: thumbnails.id }).from(thumbnails).where(eq(thumbnails.id, id));
    if (!existing) return res.status(404).json({ error: "Thumbnail not found" });

    const [updated] = await db.update(thumbnails).set({
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.image !== undefined && { image: parsed.image }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      ...(parsed.notes !== undefined && { notes: parsed.notes }),
      ...(parsed.downloadUrl !== undefined && { downloadUrl: parsed.downloadUrl }),
      ...(parsed.price !== undefined && { price: parsed.price }),
      ...(parsed.creatorName !== undefined && { creatorName: parsed.creatorName }),
      ...(parsed.youtubeUrl !== undefined && { youtubeUrl: parsed.youtubeUrl }),
      ...(parsed.views !== undefined && { views: parsed.views }),
      ...(parsed.videoTitle !== undefined && { videoTitle: parsed.videoTitle }),
      ...(parsed.category !== undefined && { category: parsed.category }),
      updatedAt: new Date(),
    }).where(eq(thumbnails.id, id)).returning();
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/thumbnails/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid thumbnail ID" });
    const [existing] = await db.select({ id: thumbnails.id }).from(thumbnails).where(eq(thumbnails.id, id));
    if (!existing) return res.status(404).json({ error: "Thumbnail not found" });

    await db.delete(thumbnails).where(eq(thumbnails.id, id));
    res.json({ message: "Thumbnail deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/transactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid transaction ID" });
    const parsed = updateTransactionSchema.parse(req.body);

    const [existing] = await db.select({ id: transactions.id, userId: transactions.userId }).from(transactions).where(eq(transactions.id, id));
    if (!existing) return res.status(404).json({ error: "Transaction not found" });

    const [updated] = await db.update(transactions).set({
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.amount !== undefined && { amount: parsed.amount }),
      ...(parsed.status !== undefined && { status: parsed.status }),
    }).where(eq(transactions.id, id)).returning();

    // Notify owner when status is explicitly set to 'paid'
    if (updated && parsed.status === "paid") {
      await createNotification({
        userId: updated.userId,
        type: "billing",
        message: `Your payment for "${updated.description}" has been marked as paid.`,
      });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid transaction ID" });
    const [existing] = await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.id, id));
    if (!existing) return res.status(404).json({ error: "Transaction not found" });

    await db.delete(transactions).where(eq(transactions.id, id));
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/thumbnails", async (req, res) => {
  try {
    const parsed = createThumbnailSchema.parse(req.body);

    // Verify referenced user exists
    const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsed.userId));
    if (!userExists) return res.status(404).json({ error: "المستخدم غير موجود" });

    const [newThumb] = await db.insert(thumbnails).values({
      userId: parsed.userId,
      title: parsed.title,
      image: parsed.image,
      status: parsed.status,
      notes: parsed.notes || null,
      downloadUrl: parsed.downloadUrl || null,
      price: parsed.price,
      creatorName: parsed.creatorName || null,
      youtubeUrl: parsed.youtubeUrl || null,
      views: parsed.views || null,
      videoTitle: parsed.videoTitle || null,
      category: parsed.category || null,
    }).returning();
    res.status(201).json(newThumb);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/transactions", async (req, res) => {
  try {
    const parsed = createTransactionSchema.parse(req.body);

    // Verify referenced user exists
    const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsed.userId));
    if (!userExists) return res.status(404).json({ error: "المستخدم غير موجود" });

    const [newTrans] = await db.insert(transactions).values({
      userId: parsed.userId,
      description: parsed.description,
      amount: parsed.amount,
      status: parsed.status,
    }).returning();
    res.status(201).json(newTrans);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/transactions/:id/pay", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid transaction ID" });

    const [existing] = await db.select({ id: transactions.id, userId: transactions.userId, description: transactions.description }).from(transactions).where(eq(transactions.id, id));
    if (!existing) return res.status(404).json({ error: "Transaction not found" });

    const [updated] = await db.update(transactions).set({ status: "paid" }).where(eq(transactions.id, id)).returning();

    // Notify the transaction owner
    if (updated) {
      await createNotification({
        userId: updated.userId,
        type: "billing",
        message: `Your payment for "${updated.description}" has been marked as paid.`,
      });
    }

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
    const { title, durationSeconds } = createSessionSchema.parse(req.body);

    const [newSession] = await db.insert(timeSessions).values({
      title,
      durationSeconds,
    }).returning();
    
    res.status(201).json(newSession);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Notifications Management
router.get("/users/:id/notifications", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    const userNotifs = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    res.json(userNotifs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const parsed = createNotificationAdminSchema.parse(req.body);

    // Verify referenced user exists
    const [userExists] = await db.select({ id: users.id }).from(users).where(eq(users.id, parsed.userId));
    if (!userExists) return res.status(404).json({ error: "المستخدم غير موجود" });

    const [newNotif] = await db.insert(notifications).values({
      userId: parsed.userId,
      message: parsed.message,
      type: parsed.type,
      read: false,
    }).returning();
    res.status(201).json(newNotif);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/notifications/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid notification ID" });
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
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
    const { fullName, avatar, password } = userSettingsSchema.parse(req.body);
    
    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (!userRecord) return res.status(404).json({ error: "User not found" });

    let updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (avatar !== undefined) updateData.avatar = avatar || null;
    if (password && password.length >= 6) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    if (!updated) return res.status(404).json({ error: "User not found" });

    // Fix 3 — Strip passwordHash before sending the updated user row.
    const { passwordHash: _omit2, ...safeUpdated } = updated;
    res.json(safeUpdated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    console.error("Admin user settings update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Admin: View Comments & Ratings for a user ---
router.get("/users/:id/comments", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
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
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });
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
    if (isNaN(thumbnailId)) return res.status(400).json({ error: "Invalid thumbnail ID" });
    const { content } = adminCommentSchema.parse(req.body);

    const [thumb] = await db.select().from(thumbnails).where(eq(thumbnails.id, thumbnailId));
    if (!thumb) return res.status(404).json({ error: "Thumbnail not found" });

    const [newComment] = await db.insert(comments).values({
      thumbnailId,
      authorName: "المدير",
      isAdmin: true,
      content,
    }).returning();

    // Notify the thumbnail owner
    await createNotification({
      userId: thumb.userId,
      type: "comment",
      message: `Muhanad left a comment on your thumbnail: "${thumb.title}"`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid input" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Admin — Revision Requests
// =======================

// GET /api/dashboard/revisions — list all revision requests with thumbnail + user info
router.get("/revisions", async (_req, res) => {
  try {
    const allRevisions = await db
      .select({
        id: revisionRequests.id,
        thumbnailId: revisionRequests.thumbnailId,
        userId: revisionRequests.userId,
        message: revisionRequests.message,
        status: revisionRequests.status,
        createdAt: revisionRequests.createdAt,
        updatedAt: revisionRequests.updatedAt,
        thumbnailTitle: thumbnails.title,
        thumbnailImage: thumbnails.image,
        userFullName: users.fullName,
        userEmail: users.email,
      })
      .from(revisionRequests)
      .leftJoin(thumbnails, eq(revisionRequests.thumbnailId, thumbnails.id))
      .leftJoin(users, eq(revisionRequests.userId, users.id))
      .orderBy(desc(revisionRequests.createdAt));

    res.json(allRevisions);
  } catch (error) {
    console.error("Admin revisions fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/dashboard/revisions/:thumbnailId — revisions for a specific thumbnail (admin)
router.get("/revisions/thumbnail/:thumbnailId", async (req, res) => {
  try {
    const thumbnailId = parseInt(req.params.thumbnailId);
    if (isNaN(thumbnailId)) return res.status(400).json({ error: "Invalid thumbnail ID" });
    const revs = await db
      .select()
      .from(revisionRequests)
      .where(eq(revisionRequests.thumbnailId, thumbnailId))
      .orderBy(desc(revisionRequests.createdAt));
    res.json(revs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/dashboard/revisions/:id — update status (admin only)
const VALID_STATUSES = ["pending", "in_progress", "completed", "rejected"];

router.patch("/revisions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid revision ID" });
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      return;
    }

    const [updated] = await db
      .update(revisionRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(revisionRequests.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Revision request not found." });
      return;
    }

    // Notify the revision owner
    const statusLabels: Record<string, string> = {
      in_progress: "is now in review",
      completed: "has been completed",
      rejected: "has been rejected",
      pending: "is pending review",
    };
    await createNotification({
      userId: updated.userId,
      type: "revision",
      message: `Your revision request ${statusLabels[status] ?? `status changed to "${status}"`}.`,
    });

    res.json(updated);
  } catch (error) {
    console.error("Admin revision update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// =======================
// Admin — Conversations / Messages
// =======================

// GET /api/dashboard/conversations — list all conversations with user info
router.get("/conversations", async (_req, res) => {
  try {
    const convs = await db
      .select({
        id: conversations.id,
        userId: conversations.userId,
        subject: conversations.subject,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        userFullName: users.fullName,
        userEmail: users.email,
      })
      .from(conversations)
      .leftJoin(users, eq(conversations.userId, users.id))
      .orderBy(desc(conversations.updatedAt));
    res.json(convs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/dashboard/conversations/:id/messages
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    if (isNaN(convId)) return res.status(400).json({ error: "Invalid conversation ID" });
    const msgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, convId))
      .orderBy(chatMessages.createdAt);
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/dashboard/conversations/:id/messages — admin sends a reply
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const convId = parseInt(req.params.id);
    if (isNaN(convId)) return res.status(400).json({ error: "Invalid conversation ID" });
    const rawBody: unknown = req.body.body;
    if (typeof rawBody !== "string" || rawBody.trim().length === 0) {
      res.status(400).json({ error: "Message body is required." });
      return;
    }
    const body = rawBody.trim().slice(0, 4000);

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId));
    if (!conv) { res.status(404).json({ error: "Conversation not found." }); return; }

    const [msg] = await db
      .insert(chatMessages)
      .values({ conversationId: convId, senderType: "admin", body, isRead: false })
      .returning();

    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, convId));

    // Notify the conversation owner (userId comes from conv record — not client input)
    await createNotification({
      userId: conv.userId,
      type: "message",
      message: "Muhanad replied to your message. Tap to view.",
    });

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PATCH /api/dashboard/messages/:id/read — mark a message as read
router.patch("/messages/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid message ID" });
    const [updated] = await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Message not found." }); return; }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
