import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { errorResponse, successResponse } from '../../utils/response';
import { submitComplaint, trackComplaint } from './complaint.service';
export const submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      res.status(400).json(errorResponse('Title, description, and category required'));
      return;
    }

    const result = await submitComplaint({
      title,
      description,
      category,
      priority: priority || 'Medium',
      attachment: req.file?.path || null,
    });

    res.status(201).json(successResponse('Complaint submitted', result));
  } catch (error) {
    next(error);
  }
};

export const track = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      res.status(400).json(errorResponse('Tracking ID required'));
      return;
    }

    const complaint = await trackComplaint(Array.isArray(trackingId) ? trackingId[0] : trackingId);
    res.status(200).json(successResponse('Complaint found', complaint));
  } catch (error) {
    next(error);
  }
};