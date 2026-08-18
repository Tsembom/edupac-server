import { Router } from "express";
import { CareerController } from "./career.controller.js";
import { protect, authorizeRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes for exploring careers
router.get("/", CareerController.getAllCareers);
router.get("/:idOrSlug", CareerController.getCareerByIdOrSlug);

// Admin-only creation route
router.post("/", protect, authorizeRole("admin"), CareerController.createCareer);

export const careerRoutes = router;
