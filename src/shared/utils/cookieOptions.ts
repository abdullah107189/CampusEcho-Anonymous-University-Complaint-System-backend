import { CookieOptions } from 'express';

export const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,      // Prevents XSS attacks
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax',     // CSRF protection
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

export const getRefreshCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh-token', // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};