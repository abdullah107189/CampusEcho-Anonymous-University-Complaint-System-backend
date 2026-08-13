// src/shared/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateToken";
import { prisma } from "../../../lib/prisma";
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
  next: NextFunction,
): Promise<void> => {
  try {
    // ✅ Get token from cookie
    let token = req.cookies?.accessToken;

    // ✅ Also check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    try {
      const decoded = verifyAccessToken(token);

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
        res.status(401).json({
          success: false,
          message: "Invalid or inactive user",
          code: "INVALID_USER",
        });
        return;
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error.message === "jwt expired") {
        res.status(401).json({
          success: false,
          message: "Token expired. Please refresh.",
          code: "TOKEN_EXPIRED",
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};
