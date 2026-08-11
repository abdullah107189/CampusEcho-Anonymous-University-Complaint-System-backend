import { Request, Response, NextFunction } from 'express';
import { submitComplaint, trackComplaint } from './complaint.service';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export const submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Title, description, and category required',
      });
      return;
    }

    const result = await submitComplaint({
      title,
      description,
      category,
      priority: priority || 'Medium',
      attachment: req.file?.path || null,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const track = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      res.status(400).json({
        success: false,
        message: 'Tracking ID required',
      });
      return;
    }

    const complaint = await trackComplaint(trackingId as string);
    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};