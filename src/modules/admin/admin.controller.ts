import { Response, NextFunction } from "express";
import {
  getComplaints,
  getComplaintById,
  getDashboardStats,
} from "./admin.service";
import {
  updateComplaintStatus,
  assignComplaint,
  addNote,
  deleteComplaint,
} from "./admin.service";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

export const getAllComplaints = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as any,
      category: req.query.category as any,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const result = await getComplaints(filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await getComplaintById(id as string);
    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status required",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const complaint = await updateComplaintStatus(
      id as string,
      status,
      req.user.id,
    );
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const assign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      res.status(400).json({
        success: false,
        message: "Staff ID required",
      });
      return;
    }
    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
      return;
    }

    const complaint = await assignComplaint(id, staffId);
    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        message: "Note content required",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }
    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
      return;
    }

    const note = await addNote(id, content, req.user.id);
    res.status(200).json({
      success: true,
      message: "Note added successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const removeComplaint = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
      return;
    }

    await deleteComplaint(id);
    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const dashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
