import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../../shared/utils/generateToken";

import {
  sendOTPEmail,
  sendWelcomeEmail,
} from "../../shared/utils/sendEmail";

import { IRegisterRequest, ILoginRequest } from "./auth.types";
import { prisma } from "../../../lib/prisma";

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

const generateOTP = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getOTPExpiry = (): Date => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

const getUserResponse = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive?: boolean;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  ...(user.isActive !== undefined && {
    isActive: user.isActive,
  }),
});

/**
 * Register user
 */
export const registerUser = async (data: IRegisterRequest) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  const hashedPassword = await bcrypt.hash(
    data.password,
    SALT_ROUNDS,
  );

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry();

  // User already exists
  if (existingUser) {
    // Already verified
    if (existingUser.isVerified) {
      throw new Error("User already exists. Please login.");
    }

    // User exists but is not verified
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        name: data.name,
        password: hashedPassword,
        otp,
        otpExpiry,
      },
    });

    await sendOTPEmail(data.email, otp, data.name);

    return {
      message: "OTP resent to your email. Please verify.",
      email: data.email,
    };
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
      isActive: false,
    },
  });

  await sendOTPEmail(user.email, otp, user.name);

  return {
    message:
      "Registration successful. Please verify your email with OTP.",
    email: user.email,
  };
};

/**
 * Verify email OTP
 */
export const verifyOTP = async (
  email: string,
  otp: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error(
      "User already verified. Please login.",
    );
  }

  if (!user.otp || user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (
    !user.otpExpiry ||
    new Date() > user.otpExpiry
  ) {
    throw new Error(
      "OTP has expired. Please request a new one.",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isVerified: true,
      isActive: true,
      otp: null,
      otpExpiry: null,
    },
  });

  await sendWelcomeEmail(
    updatedUser.email,
    updatedUser.name,
  );

  // Auto-login token
  const token = generateToken(
    updatedUser.id,
    updatedUser.role,
  );

  return {
    message: "Email verified successfully!",
    user: getUserResponse(updatedUser),
    token,
  };
};

/**
 * Resend OTP
 */
export const resendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error(
      "User already verified. Please login.",
    );
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      otp,
      otpExpiry,
    },
  });

  await sendOTPEmail(
    user.email,
    otp,
    user.name,
  );

  return {
    message: "New OTP sent to your email.",
  };
};

/**
 * Login
 */
export const loginUser = async (
  data: ILoginRequest,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Admin-only authentication
  if (user.role !== "admin") {
    throw new Error("Access denied. Admin only.");
  }

  if (!user.isVerified) {
    throw new Error(
      "Please verify your email first.",
    );
  }

  if (!user.isActive) {
    throw new Error("Account deactivated.");
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(
    user.id,
    user.role,
  );

  const refreshToken = generateRefreshToken(
    user.id,
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    user: getUserResponse(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 *
 * Uses refresh-token rotation:
 * 1. Verify existing refresh token.
 * 2. Check it matches the database.
 * 3. Generate new access token.
 * 4. Generate new refresh token.
 * 5. Replace old refresh token in database.
 */
export const refreshAccessToken = async (
  refreshToken: string,
) => {
  let decoded: { userId: string };

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: decoded.userId,
      refreshToken,
    },
  });

  if (!user) {
    throw new Error(
      "Invalid or expired refresh token",
    );
  }

  if (!user.isActive || !user.isVerified) {
    throw new Error("Account is not active");
  }

  const newAccessToken = generateAccessToken(
    user.id,
    user.role,
  );

  const newRefreshToken = generateRefreshToken(
    user.id,
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: getUserResponse(user),
  };
};

/**
 * Logout
 */
export const logoutUser = async (
  userId: string,
) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });

  return {
    message: "Logged out successfully",
  };
};

/**
 * Get current user
 */
export const getCurrentUser = async (
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
