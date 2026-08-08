export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under_Review',
  INVESTIGATING: 'Investigating',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
} as const;

export const COMPLAINT_CATEGORIES = {
  ACADEMIC: 'Academic',
  FACILITIES: 'Facilities',
  ADMINISTRATIVE: 'Administrative',
  HOSTEL: 'Hostel',
  TRANSPORT: 'Transport',
  IT_SERVICES: 'IT_Services',
  LIBRARY: 'Library',
  SPORTS: 'Sports',
  CAFETERIA: 'Cafeteria',
  OTHER: 'Other',
} as const;

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];