import { prisma } from "../../../lib/prisma";
import { Status } from "../../../prisma/generated/prisma/enums";

 

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