import { Router } from "express";
import { db } from "../lib/db.js";
import { users, thumbnails, transactions, notifications, siteContent, comments, ratings, revisionRequests, conversations, chatMessages } from "../schema/index.js";
import { requireUserAuth } from "../lib/auth.js";
import { eq, desc, and, gt, count } from "drizzle-orm";

const router = Router();

// Guest/Demo Mock Data
const guestData = {
  stats: {
    totalThumbnails: 30,
    monthlyThumbnails: 5,
    paidAmount: 250,
    remainingAmount: 50,
  },
  recentWork: [
    { id: 1, title: "فيديو التجربة الأول", status: "تم التسليم", createdAt: new Date().toISOString() },
    { id: 2, title: "قصة نجاح وهمية", status: "قيد العمل", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, title: "تحدي 24 ساعة", status: "تم التسليم", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  transactions: [
    { id: 1, date: new Date().toISOString(), description: "دفعة أولى", amount: 150, status: "paid" },
    { id: 2, date: new Date(Date.now() - 86400000 * 5).toISOString(), description: "باقي الحساب", amount: 100, status: "paid" },
    { id: 3, date: new Date().toISOString(), description: "صورة جديدة", amount: 50, status: "pending" },
  ],
  thumbnails: [
    { id: 1, image: "https://placehold.co/600x400/1a1a1a/FFFFFF?text=Thumbnail+1", title: "فيديو التجربة الأول", status: "تم التسليم", notes: "عمل رائع شكراً", createdAt: new Date().toISOString() },
    { id: 2, image: "https://placehold.co/600x400/1a1a1a/FFFFFF?text=Thumbnail+2", title: "قصة نجاح وهمية", status: "قيد العمل", notes: "", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, image: "https://placehold.co/600x400/1a1a1a/FFFFFF?text=Thumbnail+3", title: "تحدي 24 ساعة", status: "تم التسليم", notes: "الرجاء تعديل اللون الأحمر", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ]
};

router.get("/overview", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  
  if (payload.role === "guest") {
    res.json({
      stats: guestData.stats,
      recentWork: guestData.recentWork
    });
    return;
  }

  try {
    const userThumbnails = await db.select().from(thumbnails).where(eq(thumbnails.userId, payload.id)).orderBy(desc(thumbnails.createdAt));
    const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, payload.id));

    const totalThumbnails = userThumbnails.length;
    const currentMonth = new Date().getMonth();
    const monthlyThumbnails = userThumbnails.filter(t => new Date(t.createdAt).getMonth() === currentMonth).length;
    
    const paidAmount = userTransactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
    const remainingAmount = userTransactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

    res.json({
      stats: {
        totalThumbnails,
        monthlyThumbnails,
        paidAmount,
        remainingAmount
      },
      recentWork: userThumbnails.slice(0, 5)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/thumbnails", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json(guestData.thumbnails); return; }

  try {
    const userThumbnails = await db.select().from(thumbnails).where(eq(thumbnails.userId, payload.id)).orderBy(desc(thumbnails.createdAt));
    res.json(userThumbnails);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/billing", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json({ transactions: guestData.transactions, thumbnails: guestData.thumbnails }); return; }

  try {
    const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, payload.id)).orderBy(desc(transactions.createdAt));
    const userThumbnails = await db.select().from(thumbnails).where(eq(thumbnails.userId, payload.id)).orderBy(desc(thumbnails.createdAt));
    res.json({ transactions: userTransactions, thumbnails: userThumbnails });
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/notifications", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json([]); return; }

  try {
    const userNotifs = await db.select().from(notifications).where(eq(notifications.userId, payload.id)).orderBy(desc(notifications.createdAt));
    res.json(userNotifs);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/settings-content", async (req, res) => {
  try {
    const [contentRow] = await db.select().from(siteContent).where(eq(siteContent.section, "dashboardSettings"));
    const content = contentRow ? JSON.parse(contentRow.content) : { 
      updateSuccessMessage: "تم تحديث بياناتك بنجاح ✅",
      inProgressMessage: "الصورة قيد التنفيذ"
    };
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// --- Comments ---
router.get("/thumbnails/:id/comments", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const thumbnailId = parseInt(String(req.params.id));
  if (isNaN(thumbnailId)) {
    res.status(400).json({ message: "Invalid thumbnail ID." });
    return;
  }

  if (payload.role === "guest") {
    res.json([]);
    return;
  }

  try {
    // Ownership check: thumbnail must belong to authenticated user
    const [thumb] = await db
      .select({ id: thumbnails.id })
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));
    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    const thumbComments = await db.select().from(comments).where(eq(comments.thumbnailId, thumbnailId)).orderBy(desc(comments.createdAt));
    res.json(thumbComments);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.post("/thumbnails/:id/comments", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.status(403).json({ message: "غير مسموح للزوار" }); return; }

  const thumbnailId = parseInt(String(req.params.id));
  if (isNaN(thumbnailId)) {
    res.status(400).json({ message: "Invalid thumbnail ID." });
    return;
  }

  const { content } = req.body;
  if (typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ message: "محتوى التعليق مطلوب" });
    return;
  }
  const cleanContent = content.trim().slice(0, 5000);

  try {
    // Ownership check: thumbnail must belong to authenticated user
    const [thumb] = await db
      .select({ id: thumbnails.id })
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));
    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    const userRecord = await db.select().from(users).where(eq(users.id, payload.id));
    const authorName = userRecord[0]?.fullName || "مستخدم";
    const [newComment] = await db.insert(comments).values({
      thumbnailId,
      authorName,
      isAdmin: false,
      content: cleanContent,
    }).returning();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// --- Ratings ---
router.get("/thumbnails/:id/rating", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const thumbnailId = parseInt(String(req.params.id));
  if (isNaN(thumbnailId)) {
    res.status(400).json({ message: "Invalid thumbnail ID." });
    return;
  }

  if (payload.role === "guest") {
    res.json(null);
    return;
  }

  try {
    // Ownership check: thumbnail must belong to authenticated user
    const [thumb] = await db
      .select({ id: thumbnails.id })
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));
    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    const existing = await db.select().from(ratings).where(and(eq(ratings.thumbnailId, thumbnailId), eq(ratings.userId, payload.id)));
    res.json(existing[0] || null);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.post("/thumbnails/:id/rating", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.status(403).json({ message: "غير مسموح للزوار" }); return; }

  const thumbnailId = parseInt(String(req.params.id));
  if (isNaN(thumbnailId)) {
    res.status(400).json({ message: "Invalid thumbnail ID." });
    return;
  }

  const numRating = parseInt(String(req.body.rating), 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    res.status(400).json({ message: "التقييم يجب أن يكون بين 1 و 5" });
    return;
  }

  try {
    // Ownership check: thumbnail must belong to authenticated user
    const [thumb] = await db
      .select({ id: thumbnails.id })
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));
    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    // Upsert: delete old rating then insert new one
    await db.delete(ratings).where(and(eq(ratings.thumbnailId, thumbnailId), eq(ratings.userId, payload.id)));
    const [newRating] = await db.insert(ratings).values({
      thumbnailId,
      userId: payload.id,
      rating: numRating,
    }).returning();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// ─── Notification helpers ────────────────────────────────────────

type NotificationType = "system" | "thumbnail" | "comment" | "revision" | "message" | "billing";

export async function createNotification(args: {
  userId: number;
  type: NotificationType;
  message: string;
}) {
  try {
    await db.insert(notifications).values({
      userId: args.userId,
      message: args.message,
      read: false,
      type: args.type,
    });
  } catch {
    // Non-critical — never crash the main flow because of a notification failure
  }
}

// ─── Improved Notification Routes ───────────────────────────────

// GET /notifications — list all (existing, kept for compat)
router.get("/notifications", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json([]); return; }

  try {
    const userNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, payload.id))
      .orderBy(desc(notifications.createdAt));
    res.json(userNotifs);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /notifications/unread-count
router.get("/notifications/unread-count", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json({ count: 0 }); return; }

  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, payload.id), eq(notifications.read, false)));
    res.json({ count: Number(result[0]?.count ?? 0) });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// PATCH /notifications/:id/read — mark a single notification read (ownership check)
router.patch("/notifications/:id/read", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const id = parseInt(String(req.params.id));

  try {
    // Ownership: only mark if it belongs to this user
    const [notif] = await db.select().from(notifications).where(
      and(eq(notifications.id, id), eq(notifications.userId, payload.id))
    );
    if (!notif) { res.status(404).json({ message: "Not found." }); return; }

    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// PATCH /notifications/read-all
router.patch("/notifications/read-all", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  if (payload.role === "guest") { res.json({ success: true }); return; }

  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, payload.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// ─── Messaging Routes ────────────────────────────────────────────

type AuthUser = { id: number; role: string };
const getUser = (req: Express.Request) =>
  (req as typeof req & { user: AuthUser }).user;

// GET /conversations — list user's conversations
router.get("/conversations", requireUserAuth, async (req, res) => {
  const payload = getUser(req);
  if (payload.role === "guest") { res.json([]); return; }

  try {
    const convs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, payload.id))
      .orderBy(desc(conversations.updatedAt));
    res.json(convs);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// POST /conversations — create or reuse existing conversation (one per user for simplicity)
router.post("/conversations", requireUserAuth, async (req, res) => {
  const payload = getUser(req);
  if (payload.role === "guest") { res.status(403).json({ message: "Guests cannot start conversations." }); return; }

  const rawSubject: unknown = req.body.subject;
  const subject = (typeof rawSubject === "string" && rawSubject.trim())
    ? rawSubject.trim().slice(0, 200)
    : "General";

  try {
    // Check if a conversation already exists for this user
    const [existing] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, payload.id))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    if (existing) {
      res.json(existing);
      return;
    }

    const [conv] = await db
      .insert(conversations)
      .values({ userId: payload.id, subject })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// GET /conversations/:id/messages
router.get("/conversations/:id/messages", requireUserAuth, async (req, res) => {
  const payload = getUser(req);
  const convId = parseInt(String(req.params.id));

  if (payload.role === "guest") { res.json([]); return; }

  try {
    // Ownership: conversation must belong to this user
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, convId), eq(conversations.userId, payload.id)));
    if (!conv) { res.status(404).json({ message: "Conversation not found." }); return; }

    const msgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, convId))
      .orderBy(chatMessages.createdAt);

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// POST /conversations/:id/messages — user sends a message
router.post("/conversations/:id/messages", requireUserAuth, async (req, res) => {
  const payload = getUser(req);
  const convId = parseInt(String(req.params.id));

  if (payload.role === "guest") { res.status(403).json({ message: "Guests cannot send messages." }); return; }

  const rawBody: unknown = req.body.body;
  if (typeof rawBody !== "string" || rawBody.trim().length === 0) {
    res.status(400).json({ message: "Message body is required." });
    return;
  }
  const body = rawBody.trim().slice(0, 4000);

  try {
    // Ownership
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, convId), eq(conversations.userId, payload.id)));
    if (!conv) { res.status(404).json({ message: "Conversation not found." }); return; }

    const [msg] = await db
      .insert(chatMessages)
      .values({ conversationId: convId, senderType: "user", body, isRead: false })
      .returning();

    // Update conversation updatedAt
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, convId));

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// --- Single Thumbnail Detail ---
router.get("/thumbnails/:id", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const thumbnailId = parseInt(String(req.params.id));

  if (payload.role === "guest") {
    // Return guest mock thumbnail
    const mock = {
      id: thumbnailId,
      userId: 0,
      image: "https://placehold.co/1280x720/1a1a1a/FFFFFF?text=Demo+Thumbnail",
      title: "Demo Thumbnail",
      status: "تم التسليم",
      price: 50,
      notes: "هذا عمل تجريبي للعرض فقط.",
      downloadUrl: null,
      creatorName: "Demo Creator",
      youtubeUrl: null,
      views: "1.2M",
      videoTitle: "Demo Video Title",
      category: "Entertainment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    res.json(mock);
    return;
  }

  try {
    const [thumb] = await db
      .select()
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));

    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }
    res.json(thumb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// --- Revision Requests ---
router.get("/thumbnails/:id/revisions", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const thumbnailId = parseInt(String(req.params.id));

  if (payload.role === "guest") {
    res.json([]);
    return;
  }

  try {
    // Verify ownership
    const [thumb] = await db
      .select()
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));

    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    const requests = await db
      .select()
      .from(revisionRequests)
      .where(and(eq(revisionRequests.thumbnailId, thumbnailId), eq(revisionRequests.userId, payload.id)))
      .orderBy(desc(revisionRequests.createdAt));

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/thumbnails/:id/revisions", requireUserAuth, async (req, res) => {
  const payload = (req as typeof req & { user: { id: number; role: string } }).user;
  const thumbnailId = parseInt(String(req.params.id));

  if (payload.role === "guest") {
    res.status(403).json({ message: "Guests cannot submit revision requests." });
    return;
  }

  try {
    // Validate message
    const rawMessage: unknown = req.body.message;
    if (typeof rawMessage !== "string" || rawMessage.trim().length === 0) {
      res.status(400).json({ message: "Revision message is required." });
      return;
    }
    const message = rawMessage.trim().slice(0, 2000); // max 2000 chars

    // Verify ownership
    const [thumb] = await db
      .select()
      .from(thumbnails)
      .where(and(eq(thumbnails.id, thumbnailId), eq(thumbnails.userId, payload.id)));

    if (!thumb) {
      res.status(404).json({ message: "Thumbnail not found." });
      return;
    }

    const [revision] = await db
      .insert(revisionRequests)
      .values({
        thumbnailId,
        userId: payload.id,
        message,
        status: "pending",
      })
      .returning();

    res.status(201).json(revision);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
