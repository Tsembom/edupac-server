import { Router } from "express";
import { UserController } from "./user.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// Protected user routes
router.get("/me", protect, UserController.getMe);
router.patch("/me", protect, UserController.updateProfile);
router.get("/search", protect, UserController.search);
router.get("/:username", protect, UserController.getByUsername);

export const userRoutes = router;
