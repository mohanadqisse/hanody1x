import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { requireAuth } from "../lib/auth.js";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: any, file: any) => {
    const extension = file.originalname.split(".").pop();
    const publicId = _req.body.publicId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      folder: "portfolio",
      format: extension, // supports 'jpg', 'png', etc.
      public_id: publicId,
      overwrite: true,
      invalidate: true,
    } as any;
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.post("/", requireAuth, (req, res, next) => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      console.error("Cloudinary Upload Error:", err);
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
    
    // Cloudinary returns the full URL in req.file.path
    res.json({ url: (req.file as any).path });
  });
});

router.delete("/:publicId", requireAuth, async (req, res) => {
  try {
    const publicIdWithExt = req.params.publicId as string;
    const publicId = publicIdWithExt.split(".")[0];
    await cloudinary.uploader.destroy(`portfolio/${publicId}`, { invalidate: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حذف الملف" });
  }
});

export default router;
