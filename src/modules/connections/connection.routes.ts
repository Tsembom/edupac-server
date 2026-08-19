import { Router } from "express";
import { ConnectionController } from "./connection.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import {
  createConnectionSchema,
  respondConnectionSchema,
} from "./connection.validation.js";

const router = Router();

// All connection routes require authentication
router.use(protect);

router.post(
  "/request",
  validateRequest(createConnectionSchema),
  ConnectionController.requestConnection
);

router.patch(
  "/:connectionId/respond",
  validateRequest(respondConnectionSchema),
  ConnectionController.respondToRequest
);

router.delete("/:connectionId", ConnectionController.removeConnection);

router.get("/my", ConnectionController.getMyConnections);
router.get("/pending", ConnectionController.getPendingRequests);
router.get("/sent", ConnectionController.getSentRequests);

export const connectionRoutes = router;
