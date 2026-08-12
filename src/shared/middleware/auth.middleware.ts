// src/shared/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/generateToken'; 
import { prisma } from '../../../lib/prisma';
export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ✅ Get token from cookie
    let token = req.cookies?.accessToken;
    
    console.log('🔑 Auth Middleware:', {
      hasCookie: !!req.cookies,
      hasAccessToken: !!token,
      cookies: req.cookies,
    });
    
    // ✅ Also check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('📤 Token from header:', token?.substring(0, 20) + '...');
      }
    }
    
    if (!token) {
      console.log('❌ No token found');
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    try {
      console.log('🔍 Verifying token...');
      const decoded = verifyAccessToken(token);
      console.log('✅ Token verified for user:', decoded.userId);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive');
        res.status(401).json({
          success: false,
          message: 'Invalid or inactive user',
          code: 'INVALID_USER',
        });
        return;
      }

      req.user = user;
      console.log('✅ User authenticated:', user.email);
      next();
    } catch (error: any) {
      console.log('❌ Token verification error:', error.message);
      if (error.message === 'jwt expired') {
        console.log('⏰ Token expired!');
        res.status(401).json({
          success: false,
          message: 'Token expired. Please refresh.',
          code: 'TOKEN_EXPIRED', // ✅ This is what frontend checks
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.log('❌ Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
};