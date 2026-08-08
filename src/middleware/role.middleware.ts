import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Role } from '../../prisma/generated/prisma/enums';

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    next();
  };
};