const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorMiddleware = require("./middlewares/error.middleware");

const authRoutes   = require("./modules/auth/auth.routes");
const userRoutes   = require("./modules/users/user.routes");
const eventRoutes  = require("./modules/events/event.routes");
const pollRoutes   = require("./modules/polls/poll.routes");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// ── Rate limiting (tighter on auth) ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: "Too many requests, try again later." },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",   authLimiter, authRoutes);
app.use("/api/users",  userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/polls",  pollRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) =>
  res.json({ success: true, message: "CampusConnect API is alive 🎓" })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
