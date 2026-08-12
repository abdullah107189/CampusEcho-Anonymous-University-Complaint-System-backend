import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { prisma } from "../../../lib/prisma";

dotenv.config();

const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@campusecho.com" },
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("asdfAa", 10);

    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@campusecho.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isActive: true,
      },
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@campusecho.com");
    console.log("🔑 Password: ChangeMe123!");
    console.log("⚠️  Please change password in production!");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
