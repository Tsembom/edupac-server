import { Request, Response, NextFunction } from "express";
import { GuidanceService } from "./guidance.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";

export class GuidanceController {
  static async syncRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const studentId = req.user._id.toString();
      const roadmap = await GuidanceService.syncRoadmap(studentId, req.body);

      ApiResponse.success({
        res,
        statusCode: 200,
        message: "AI recommendation roadmap saved successfully",
        data: roadmap,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const studentId = req.user._id.toString();
      const roadmap = await GuidanceService.getMyRoadmap(studentId);

      ApiResponse.success({
        res,
        statusCode: 200,
        message: "Roadmap retrieved successfully",
        data: roadmap,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const requesterId = req.user._id.toString();
      const studentId = Array.isArray(req.params.studentId)
        ? req.params.studentId[0]
        : req.params.studentId;

      const result = await GuidanceService.getStudentRoadmap(requesterId, studentId);

      ApiResponse.success({
        res,
        statusCode: 200,
        message: "Student recommendation roadmap retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
