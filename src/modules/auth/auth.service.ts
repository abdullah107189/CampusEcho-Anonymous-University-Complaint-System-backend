import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../../shared/utils/generateToken";
import { sendOTPEmail, sendWelcomeEmail } from "../../shared/utils/sendEmail";
import { IRegisterRequest, ILoginRequest } from "./auth.types";
import { prisma } from "../../../lib/prisma";

export const registerUser = async (data: IRegisterRequest) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error("User already exists. Please login.");
    } else {
      // User exists but not verified - update password and resend OTP
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      const result = await prisma.user.update({
        where: { email: data.email },
        data: {
          name: data.name,
          password: hashedPassword,
          otp,
          otpExpiry,
        },
      });
      console.log(result);

      await sendOTPEmail(data.email, otp, data.name);
      return {
        message: "OTP resent to your email. Please verify.",
        email: data.email,
      };
    }
  }

  // Create new user
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      otp,
      otpExpiry,
    },
  });

  // Send OTP email
  await sendOTPEmail(data.email, otp, data.name);

  return {
    message: "Registration successful. Please verify your email with OTP.",
    email: user.email,
  };
};

export const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("User already verified. Please login.");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpiry && new Date() > user.otpExpiry) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Verify user
  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      isActive: true,
      otp: null,
      otpExpiry: null,
    },
  });

  // Send welcome email
  await sendWelcomeEmail(email, user.name);

  // Generate token for auto-login
  const token = generateToken(user.id, user.role);

  return {
    message: "Email verified successfully!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: true,
    },
    token,
  };
};

export const resendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("User already verified. Please login.");
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: {
      otp,
      otpExpiry,
    },
  });

  await sendOTPEmail(email, otp, user.name);

  return {
    message: "New OTP sent to your email.",
  };
};

export const loginUser = async (data: ILoginRequest) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.role !== "admin") {
    throw new Error("Access denied. Admin only.");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email first.");
  }

  if (!user.isActive) {
    throw new Error("Account deactivated.");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // ✅ Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken: refreshToken,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => { 

  try {
    // 1️⃣ Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    console.log("✅ Decoded:", decoded);

    // 2️⃣ Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      throw new Error("User not found or refresh token does not match");
    }

    console.log("✅ User found:", user.email);
    console.log("✅ Refresh token matches database!");

    // 3️⃣ Generate new access token
    console.log("3️⃣ Generating new access token...");
    const newAccessToken = generateAccessToken(user.id, user.role);
    console.log("✅ New access token generated");

    // 4️⃣ OPTIONAL: Generate new refresh token (refresh token rotation)
    // Uncomment this for better security
    /*
    const newRefreshToken = generateRefreshToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });
    console.log('✅ New refresh token generated and saved');
    */

    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // refreshToken: newRefreshToken, // If using rotation
    };
  } catch (error: any) {
    console.error("❌ Refresh service error:", error.message);
    throw new Error(error.message || "Invalid refresh token");
  }
};
export const logoutUser = async (userId: string) => {
  // Clear refresh token from database
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { message: "Logged out successfully" };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
