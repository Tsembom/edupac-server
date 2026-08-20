import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { protect, authorizeRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// All admin endpoints require authentication and admin role
router.use(protect);
router.use(authorizeRole("admin"));

router.get("/stats", AdminController.getStats);
router.get("/schools", AdminController.getSchools);
router.patch("/schools/:schoolId/verify", AdminController.verifySchool);
router.get("/users", AdminController.getUsers);

export default router;
