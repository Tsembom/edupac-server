import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
import { AppError } from "./utils/appError.js";
import { ApiResponse } from "./utils/apiResponse.js";

// Import Module Routes
import { authRoutes } from "./modules/auth/auth.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { connectionRoutes } from "./modules/connections/connection.routes.js";
import { careerRoutes } from "./modules/careers/career.routes.js";

export const createApp = () => {
  const app = express();

  // 1. Security HTTP Headers
  app.use(helmet());

  // 2. Cross-Origin Resource Sharing (CORS)
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 3. HTTP Request Logging
  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // 4. Rate Limiting for general API
  app.use("/api", apiLimiter);

  // 5. Body Parsers & Parameter Pollution Prevention
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(hpp());

  // 6. Root & Healthcheck Endpoints
  app.get("/", (_req: Request, res: Response) => {
    ApiResponse.success({
      res,
      message: "Edupac Backend API is operational",
      data: {
        environment: env.NODE_ENV,
        version: "1.0.0",
        documentation: "/api/v1/health",
      },
    });
  });

  app.get("/api/v1/health", (_req: Request, res: Response) => {
    ApiResponse.success({
      res,
      message: "API service is healthy",
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 7. Mount Module Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/connections", connectionRoutes);
  app.use("/api/v1/careers", careerRoutes);

  // 8. Handle Undefined Routes (404)
  app.all("*", (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server`, 404));
  });

  // 9. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
