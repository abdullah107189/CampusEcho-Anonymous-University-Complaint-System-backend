import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/config";
import { errorMiddleware } from "./middleware/error.middleware";



import authRoutes from '../src/modules/auth/auth.routes';
import complaintRoutes from '../src/modules/complaint/complaint.routes';
import adminRoutes from '../src/modules/admin/admin.routes';

const app = express();

// ====================== GLOBAL MIDDLEWARES ======================

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

// Logging
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
// ====================== ROUTES ======================
// app.use("/api/v1/complaints", complaintRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CampusEcho Backend is running smoothly!",
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler  
app.use(errorMiddleware);

export default app;
