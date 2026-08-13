import { Request, Response, NextFunction } from "express";

import {
  registerUser,
  verifyOTP,
  loginUser,
  getCurrentUser,
  resendOTP as resendOTPService,
  refreshAccessToken,
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


// For production:
 export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
 export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken?: string,
): void => {
  res.cookie("accessToken", accessToken, {
    ...getCookieOptions(),
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      ...getRefreshCookieOptions(),
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
};

const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getRefreshCookieOptions());
};

/**
 * Register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        email: result.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email OTP
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = verifyOTPSchema.parse(req.body);

    const result = await verifyOTP(data.email, data.otp);

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

/**
 * Resend OTP
 */
export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = resendOTPSchema.parse(req.body);

    const result = await resendOTPService(data.email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(data);

    setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token required",
        code: "REFRESH_REQUIRED",
      });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    setAuthCookies(res, result.accessToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user) {
      await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          refreshToken: null,
        },
      });
    }

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
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
