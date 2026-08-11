import { Router } from 'express';
import { 
  register, 
  verifyEmail, 
  resendOTP, 
  login, 
  refreshToken,
  logout,
  getMe 
} from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/refresh-token', refreshToken); // New route for refreshing

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);

export default router;