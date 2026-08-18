import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  AuthController.refresh
);

export const authRoutes = router;
