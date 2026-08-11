import dotenv from "dotenv";
import path from "path";

// Load environment variables first
dotenv.config({ path: path.join(__dirname, "../.env") });

import app from "./app";
import { prisma } from "../lib/prisma";

// Configuration
const PORT = parseInt(process.env.PORT || "5000", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// Function to start server
const startServer = async () => {
  try {
    // 1. Check Database Connection
    console.log("🔍 Checking database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // 2. Start Express Server
    const server = app.listen(PORT, () => {
      console.log("\n🚀 ========================================");
      console.log(`🚀 CampusEcho Server is running!`);
      console.log("🚀 ========================================");
      console.log(`📍 Local:    http://localhost:${PORT}`);
      console.log(`📡 API:      http://localhost:${PORT}/api`);
      console.log(`❤️  Health:   http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📅 Started:  ${new Date().toISOString()}`);
      console.log("🚀 ========================================\n");
    });

    // 3. Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log("💀 HTTP server closed");

        try {
          await prisma.$disconnect();
          console.log("💀 Database disconnected");
        } catch (error) {
          console.error("❌ Error disconnecting database:", error);
        }

        console.log("✅ Shutdown complete");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("⚠️ Force shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // 4. Handle Uncaught Errors
    process.on("uncaughtException", (error) => {
      console.error("💥 Uncaught Exception:", error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
      shutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
export default app;
