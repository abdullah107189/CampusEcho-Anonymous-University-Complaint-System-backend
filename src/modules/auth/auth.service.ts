import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../../shared/utils/generateToken";
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

  if (!user.isVerified) {
    throw new Error(
      "Please verify your email first. Check your inbox for OTP.",
    );
  }

  if (!user.isActive) {
    throw new Error("Account deactivated. Please contact admin.");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    token,
  };
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
