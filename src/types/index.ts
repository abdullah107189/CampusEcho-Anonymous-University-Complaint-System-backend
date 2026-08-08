import { Request } from 'express';
import { Category, Role, Status } from '../../prisma/generated/prisma/enums';
// import { Role, Status, Category, Priority } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ComplaintFilters {
  status?: Status;
  category?: Category;
  search?: string;
  page?: number;
  limit?: number;
}