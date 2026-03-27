import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth } from "../lib/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const extName = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(extName)) {
      cb(null, true);
    } else {
      cb(new Error("نوع الملف أو الامتداد غير مدعوم"));
    }
  },
});

const router = Router();

router.post("/", requireAuth, (req, res, next) => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت" });
          return;
        }
        res.status(400).json({ message: `خطأ في رفع الملف: ${err.message}` });
        return;
      }
      res.status(400).json({ message: err.message || "خطأ في رفع الملف" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "لم يتم تحميل أي ملف" });
      return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

router.delete("/:filename", requireAuth, (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename as string);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "الملف غير موجود" });
  }
});

export default router;
