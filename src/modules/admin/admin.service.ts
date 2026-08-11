  
import { prisma } from '../../../lib/prisma';
import { Status } from '../../../prisma/generated/prisma/enums';

export const getComplaints = async (filters: any = {}) => {
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

export const getComplaintById = async (id: string) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
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
      statusHistory: {
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { changedAt: 'desc' },
      },
    },
  });

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  return complaint;
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: Status,
  userId: string
) => {
  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      statusHistory: {
        create: {
          status,
          changedById: userId,
        },
      },
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return complaint;
};

export const assignComplaint = async (complaintId: string, staffId: string) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
    throw new Error('Invalid staff member');
  }

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedToId: staffId,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return complaint;
};

export const addNote = async (complaintId: string, content: string, userId: string) => {
  const note = await prisma.note.create({
    data: {
      content,
      complaintId,
      addedById: userId,
    },
    include: {
      addedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return note;
};

export const deleteComplaint = async (complaintId: string) => {
  await prisma.$transaction([
    prisma.note.deleteMany({ where: { complaintId } }),
    prisma.statusHistory.deleteMany({ where: { complaintId } }),
    prisma.complaint.delete({ where: { id: complaintId } }),
  ]);

  return { success: true };
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