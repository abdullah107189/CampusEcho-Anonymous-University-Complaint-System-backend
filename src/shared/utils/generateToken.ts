import jwt from 'jsonwebtoken';

// Access Token (Short lived - 15 minutes)
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } // 15 minutes
  );
};

// Refresh Token (Long lived - 7 days)
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' } // 7 days
  );
};

// Verify Access Token
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Old functions (keep for backward compatibility)
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;