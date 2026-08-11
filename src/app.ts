import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './shared/middleware/error.middleware';  

// Import all module routes
import authRoutes from './modules/auth/auth.routes';
import complaintRoutes from './modules/complaint/complaint.routes';
import adminRoutes from './modules/admin/admin.routes';
import { config } from './config/config';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root routes - All modules connected here
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CampusEcho API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CampusEcho API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling
app.use(errorMiddleware);

export default app;