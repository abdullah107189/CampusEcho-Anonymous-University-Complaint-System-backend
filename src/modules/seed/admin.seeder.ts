import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { prisma } from "../../../lib/prisma";

dotenv.config();

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@campusecho.com";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ADMIN_NAME =
  process.env.ADMIN_NAME ?? "Admin User";

const SALT_ROUNDS = 10;

const seedAdmin = async (): Promise<void> => {
  try {
    if (!ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_PASSWORD is not defined in environment variables.",
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: ADMIN_EMAIL,
      },
    });

    if (existingAdmin) {
      console.log(
        `Admin already exists: ${ADMIN_EMAIL}`,
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      SALT_ROUNDS,
    );

    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isActive: true,
      },
    });

    console.log("Admin created successfully");
    console.log(`Email: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

void seedAdmin();
