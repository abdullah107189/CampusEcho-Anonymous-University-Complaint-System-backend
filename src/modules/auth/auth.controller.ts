import { Request, Response, NextFunction } from 'express';  
import { errorResponse, successResponse } from '../../utils/response';
import { getCurrentUser, loginUser } from './authService';
import { AuthRequest } from '../../types';
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json(errorResponse('Email and password required'));
      return;
    }

    const result = await loginUser(email, password);
    res.status(200).json(successResponse('Login successful', result));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated'));
      return;
    }

    const user = await getCurrentUser(req.user.id);
    res.status(200).json(successResponse('User found', user));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json(successResponse('Logged out successfully'));
};