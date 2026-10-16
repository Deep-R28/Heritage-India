import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error.js";

import statsRouter from "./routes/stats.js";
import authRouter from "./routes/auth.js";
import meRouter from "./routes/me.js";
import sitesRouter from "./routes/sites.js";
import guidesRouter from "./routes/guides.js";
import pricingRouter from "./routes/pricing.js";
import bookingsRouter from "./routes/bookings.js";
import paymentsRouter from "./routes/payments.js";
import contactRouter from "./routes/contact.js";
import aiRouter from "./routes/ai.js";

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [config.frontendOrigin, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Mount Routes
app.use("/api/stats", statsRouter);
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/guides", guidesRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/ai", aiRouter);

// Centralized Error Handler
app.use(errorHandler);

export default app;
