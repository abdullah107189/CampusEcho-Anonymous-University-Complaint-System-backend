import { prisma } from "../../../lib/prisma";
import { generateTrackingId } from "../../shared/utils/generateTrackingId";

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
      priority: data.priority || "Medium",
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
    throw new Error("Complaint not found");
  }

  return complaint;
};
