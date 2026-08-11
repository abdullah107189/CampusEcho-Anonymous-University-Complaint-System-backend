import { Request, Response, NextFunction } from 'express';
import { 
  registerUser, 
  verifyOTP,  
  loginUser, 
  getCurrentUser,
  resendOTP as resendOTPService,
  refreshAccessToken,
  logoutUser,
} from './auth.service';
import { 
  registerSchema, 
  loginSchema, 
  verifyOTPSchema, 
  resendOTPSchema 
} from './auth.validation';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { getCookieOptions, getRefreshCookieOptions } from '../../shared/utils/cookieOptions';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  next: NextFunction
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

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);
    
    // Set tokens in cookies (HTTP Only)
    const cookieOptions = getCookieOptions();
    const refreshCookieOptions = getRefreshCookieOptions();
    
    // Access Token - Short lived
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    // Refresh Token - Long lived
    res.cookie('refreshToken', result.refreshToken, {
      ...refreshCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }
    
    const result = await refreshAccessToken(refreshToken);
    
    // Set new access token in cookie
    const cookieOptions = getCookieOptions();
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }
    
    await logoutUser(req.user.id);
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
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