import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { contactMessages } from "../schema/index.js";
import { requireAuth } from "../lib/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  packageType: z.string().optional(),
  details: z.string().min(1),
});

router.post("/", async (req, res) => {
  try {
    const data = messageSchema.parse(req.body);
    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      service: data.packageType || null,
      message: data.details,
    });
    res.json({ success: true, message: "تم إرسال الرسالة بنجاح" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: "بيانات غير صالحة" });
      return;
    }
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const id = z.coerce.number().parse(req.params.id);
    await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = z.coerce.number().parse(req.params.id);
    await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

export default router;
