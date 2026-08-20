import { Router } from "express";
import { GuidanceController } from "./guidance.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// All guidance endpoints require valid authentication
router.use(protect);

router.post("/sync", GuidanceController.syncRoadmap);
router.get("/me", GuidanceController.getMyRoadmap);
router.get("/student/:studentId", GuidanceController.getStudentRoadmap);

export default router;
