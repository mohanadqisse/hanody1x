import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import uploadRouter from "./routes/upload.js";
import healthRouter from "./routes/health.js";
import messagesRouter from "./routes/messages.js";
import rateLimit from "express-rate-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/upload", uploadRouter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { message: "عدد طلبات كبير جداً، يرجى المحاولة لاحقاً." },
});
app.use("/api/messages", apiLimiter, messagesRouter);

// Serve static client files in production
const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDistPath));

// SPA catch-all: serve index.html for any non-API route
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
