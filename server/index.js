import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { i18nMiddleware } from "./i18n/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
// NOTE: the remaining routers below still use the pre-refactor
// controllers/routes on disk. Migrate them to the same layered pattern
// (routes -> validators -> controller -> service) used in auth.routes.js.
import thesisRoutes from "./routes/thesis.routes.js";
import userRoutes from "./routes/user.js";
import notificationRoutes from "./routes/notification.js";
import apiRoutes from "./routes/api.js";
import deadlineRoutes from "./routes/deadline.js";
import statusRoutes from "./routes/studentstatus.js";
import "./cronJobs/checkDeadlines.js";

dotenv.config();

const app = express();

// --- Security & parsing ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

// --- i18n: adds req.t(), req.language driven by ?lang= or Accept-Language ---
app.use(i18nMiddleware);

// --- Routes ---
app.use("/deadlines", deadlineRoutes);
app.use("/status", statusRoutes);
app.use("/api", apiRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/theses", thesisRoutes);
app.use("/notifications", notificationRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- 404 + centralized error handler (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 6001;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
};

start();

// Guard rails so a stray rejected promise doesn't silently kill the process
process.on("unhandledRejection", (reason) => {
  console.error("[Unhandled Rejection]", reason);
});
