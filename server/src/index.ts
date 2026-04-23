import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import uploadRouter from "./routes/upload.js";
import healthRouter from "./routes/health.js";
import messagesRouter from "./routes/messages.js";
import dashboardRouter from "./routes/dashboard.js";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ];
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow Vercel preview deployments
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    // Allow custom domain
    if (origin.includes("hanody1x.space")) return callback(null, true);
    // Allow listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { message: "عدد طلبات كبير جداً، يرجى المحاولة لاحقاً." },
});
app.use("/api/messages", apiLimiter, messagesRouter);

// Root route for API server
app.get("/", (_req, res) => {
  res.send("API Server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Set up an automatic self-ping mechanism to keep the server awake on Render free tier
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_EXTERNAL_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${RENDER_EXTERNAL_URL}/api/healthz`, {
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (res.ok) {
          console.log(`[Keep-Alive] Self-ping successful: ${RENDER_EXTERNAL_URL}`);
        } else {
          console.error(`[Keep-Alive] Self-ping failed with status: ${res.status}`);
        }
      } catch (error) {
        console.error("[Keep-Alive] Self-ping error:", error);
      }
    }, 8 * 60 * 1000); // Trigger every 8 minutes (Render sleeps after 15 mins)
  }
});

export default app;
