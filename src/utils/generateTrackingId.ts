import crypto from 'crypto';

export const generateTrackingId = (): string => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `CE-${random}`;
};