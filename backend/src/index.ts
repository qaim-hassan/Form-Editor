import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import formsRouter from "./routes/forms.js";
import submissionsRouter from "./routes/submissions.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(helmet());
// Normalize CORS origins from env (comma-separated). Trim whitespace and trailing slashes.
const rawCors = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const allowedOrigins = Array.isArray(rawCors)
  ? rawCors.map((s) => String(s).trim().replace(/\/+$|\s+/g, ""))
  : String(rawCors)
      .split(",")
      .map((s) => s.trim().replace(/\/+$/g, ""))
      .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is running. Use /health for status and /api/* for endpoints.",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/forms", formsRouter);
app.use("/api/submissions", submissionsRouter);

app.use(errorHandler);

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export default app;
// ok