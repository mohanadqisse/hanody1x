import { Router } from "express";
import { db } from "../lib/db.js";
import { users, thumbnails, transactions, notifications, siteContent } from "../schema/index.js";
import { requireUserAuth } from "../lib/auth.js";
import { eq, desc, and } from "drizzle-orm";

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

export default router;
