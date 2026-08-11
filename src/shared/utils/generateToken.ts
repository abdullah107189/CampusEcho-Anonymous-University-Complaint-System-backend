import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
