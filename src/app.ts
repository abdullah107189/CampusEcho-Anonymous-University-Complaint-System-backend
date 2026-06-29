import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/config";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// Security & Basic Middlewares
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
// app.use("/api/v1/complaints", complaintRoutes);
// app.use("/api/v1/admin", adminRoutes);

// Health Check
app.get("/health", (req, res) =>
  res.status(200).json({ status: "healthy", uptime: process.uptime() }),
);

app.get("/", (req, res) =>
  res.status(200).json({ message: "Welcome to CampusEcho API" }),
);
// Global Error Handler
app.use(errorMiddleware);

export default app;
