import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { getComplaints, getDashboardStats } from '../complaint/complaint.service';
import { errorResponse, successResponse } from '../../utils/response';
import { addNote, assignComplaint, deleteComplaint, updateComplaintStatus } from './admin.service';

export const getAllComplaints = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as any,
      category: req.query.category as any,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const result = await getComplaints(filters);
    res.status(200).json(successResponse('Complaints fetched', result));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json(errorResponse('Status required'));
      return;
    }

    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated'));
      return;
    }

    const complaint = await updateComplaintStatus(id, status, req.user.id);
    res.status(200).json(successResponse('Status updated', complaint));
  } catch (error) {
    next(error);
  }
};

export const assign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      res.status(400).json(errorResponse('Staff ID required'));
      return;
    }

    const complaint = await assignComplaint(id, staffId);
    res.status(200).json(successResponse('Complaint assigned', complaint));
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json(errorResponse('Note content required'));
      return;
    }

    if (!req.user) {
      res.status(401).json(errorResponse('Not authenticated'));
      return;
    }

    const note = await addNote(id, content, req.user.id);
    res.status(200).json(successResponse('Note added', note));
  } catch (error) {
    next(error);
  }
};

export const removeComplaint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteComplaint(id);
    res.status(200).json(successResponse('Complaint deleted'));
  } catch (error) {
    next(error);
  }
};

export const dashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(successResponse('Dashboard stats', stats));
  } catch (error) {
    next(error);
  }
};