import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { requireAuth, requireUploadAuth } from "../lib/auth.js";
import { cloudinary } from "../lib/cloudinary.js";

// Fix 7 — Allowed MIME types and corresponding safe Cloudinary format strings.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

// Configure Multer Storage for Cloudinary.
// Fix 7 — publicId is generated server-side only; client cannot control it.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: unknown, file: Express.Multer.File) => {
    const format = ALLOWED_MIME_TYPES[file.mimetype];
    // Generate a collision-resistant, server-controlled public ID.
    const publicId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return {
      folder: "portfolio",
      format,           // only whitelisted formats reach Cloudinary
      public_id: publicId,
      overwrite: false, // Fix 7 — never overwrite existing assets
      invalidate: true,
    } as Record<string, unknown>;
  },
});

// Fix 7 — fileFilter rejects any MIME type not in the whitelist before upload begins.
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed. Allowed formats: JPEG, PNG, WebP, GIF"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = Router();

router.post("/", requireUploadAuth, (req, res, next) => {
  upload.single("image")(req, res, (err: unknown) => {
    if (err) {
      console.error("Upload Error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ message: "File size exceeds 10 MB limit" });
          return;
        }
        res.status(400).json({ message: `Upload error: ${err.message}` });
        return;
      }
      if (err instanceof Error) {
        res.status(400).json({ message: err.message || "File upload error" });
        return;
      }
      res.status(400).json({ message: "File upload error" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file was uploaded" });
      return;
    }
    // Cloudinary returns the full URL in req.file.path
    res.json({ url: (req.file as Express.Multer.File & { path: string }).path });
  });
});

router.delete("/:publicId", requireAuth, async (req, res) => {
  try {
    const publicIdWithExt = req.params.publicId as string;
    if (!publicIdWithExt || !/^[a-zA-Z0-9_\-\.]+$/.test(publicIdWithExt)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    const publicId = publicIdWithExt.split(".")[0];
    await cloudinary.uploader.destroy(`portfolio/${publicId}`, { invalidate: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

export default router;
