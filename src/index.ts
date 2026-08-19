import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    // 1. Connect to MongoDB database
    await connectDatabase();

    // 2. Instantiate Express App
    const app = createApp();

    // 3. Start listening on configured port
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Edupac Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`📡 Healthcheck available at: http://localhost:${env.PORT}/api/v1/health`);
    });

    // 4. Handle unhandled Promise rejections
    process.on("unhandledRejection", (err: Error) => {
      console.error("💥 UNHANDLED REJECTION! Shutting down server gracefully...", err);
      server.close(() => {
        process.exit(1);
      });
    });

    // 5. Handle SIGTERM / SIGINT for graceful shutdown
    const handleShutdown = (signal: string) => {
      console.log(`\n🛑 ${signal} received. Closing HTTP server...`);
      server.close(() => {
        console.log("💤 Process terminated cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start Edupac Server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down immediately...", err);
  process.exit(1);
});

startServer();
