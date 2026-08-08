import { prisma } from "../../../lib/prisma";
import { ComplaintFilters } from "../../types";
import { generateTrackingId } from "../../utils/generateTrackingId";


export const submitComplaint = async (data: {
  title: string;
  description: string;
  category: any;
  priority: any;
  attachment?: string | null;
}) => {
  const trackingId = generateTrackingId();

  const complaint = await prisma.complaint.create({
    data: {
      trackingId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'Medium',
      attachment: data.attachment || null,
    },
  });

  return { trackingId: complaint.trackingId };
};

export const trackComplaint = async (trackingId: string) => {
  const complaint = await prisma.complaint.findUnique({
    where: { trackingId },
    select: {
      trackingId: true,
      title: true,
      description: true,
      category: true,
      status: true,
      priority: true,
      createdAt: true,
    },
  });

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  return complaint;
};

export const getComplaints = async (filters: ComplaintFilters = {}) => {
  const { status, category, search, page = 1, limit = 10 } = filters;

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  
  if (search) {
    where.OR = [
      { trackingId: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notes: {
          include: {
            addedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    complaints,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDashboardStats = async () => {
  const [total, pending, underReview, investigating, resolved, rejected] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: 'Pending' } }),
    prisma.complaint.count({ where: { status: 'Under_Review' } }),
    prisma.complaint.count({ where: { status: 'Investigating' } }),
    prisma.complaint.count({ where: { status: 'Resolved' } }),
    prisma.complaint.count({ where: { status: 'Rejected' } }),
  ]);

  return {
    totalComplaints: total,
    pending,
    underReview,
    investigating,
    resolved,
    rejected,
  };
};