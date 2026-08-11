import { Request, Response, NextFunction } from 'express';
import { 
  registerUser, 
  verifyOTP, 
  resendOTP, 
  loginUser, 
  getCurrentUser 
} from './auth.service'; 
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { loginSchema, registerSchema, resendOTPSchema, verifyOTPSchema } from '../auth/auth.validation';

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

export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = resendOTPSchema.parse(req.body);
    const result = await resendOTP(validatedData.email);
    
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
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
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

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};