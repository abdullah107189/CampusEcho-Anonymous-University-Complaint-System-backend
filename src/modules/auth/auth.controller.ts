import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  getCurrentUser,
  resendOTP as resendOTPService,
  refreshAccessToken,
  logoutUser,
} from "./auth.service";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
} from "./auth.validation";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import {
  getCookieOptions,
  getRefreshCookieOptions,
} from "../../shared/utils/cookieOptions";
import { prisma } from "../../../lib/prisma";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: result.message,
      data: { email: result.email },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = verifyOTPSchema.parse(req.body);
    const result = await verifyOTP(validatedData.email, validatedData.otp);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = resendOTPSchema.parse(req.body);

    const result = await resendOTPService(validatedData.email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("🔐 ===== LOGIN CONTROLLER =====");
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);

    console.log("✅ Login successful for:", result.user.email);
    console.log("🔑 Access Token exists:", !!result.accessToken);
    console.log("🔑 Refresh Token exists:", !!result.refreshToken);

    // ✅ Set cookies
    const cookieOptions = getCookieOptions();
    const refreshCookieOptions = getRefreshCookieOptions();

    // Access Token - 10 seconds
    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 10 * 1000, // 10 seconds
    });
    console.log("✅ Access token cookie set (10s)");

    // Refresh Token - 10 minutes
    res.cookie("refreshToken", result.refreshToken, {
      ...refreshCookieOptions,
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
    console.log("✅ Refresh token cookie set (10min)");

    console.log("✅ Cookies set successfully");

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    next(error);
  }
};


export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { 
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      console.log('❌ No refresh token');
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
        code: 'REFRESH_REQUIRED',
      });
      return;
    }

    const result = await refreshAccessToken(refreshToken);
    
    // ✅ Set new access token
    const cookieOptions = getCookieOptions();
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 10 * 1000, // 10 seconds
    });
    console.log('✅ New access token set in cookie');
    
    // ✅ If using refresh token rotation, set new refresh token too
    // if (result.refreshToken) {
    //   res.cookie('refreshToken', result.refreshToken, {
    //     ...cookieOptions,
    //     maxAge: 10 * 60 * 1000,
    //   });
    //   console.log('✅ New refresh token set in cookie');
    // }
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error('❌ Refresh error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token',
      code: 'REFRESH_FAILED',
    });
  }
};


export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🚪 ===== LOGOUT =====');
    
    // ✅ Clear refresh token from database
    if (req.user) {
      console.log('👤 Clearing refresh token for user:', req.user.email);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
      });
      console.log('✅ Refresh token cleared from database');
    }
    
    // ✅ Clear cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    console.log('✅ Cookies cleared');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
