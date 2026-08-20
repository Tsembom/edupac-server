import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";

export class AdminController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getPlatformStats();
      ApiResponse.success({
        res,
        statusCode: 200,
        message: "Platform statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchools(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const schools = await AdminService.getSchools(status as string);
      ApiResponse.success({
        res,
        statusCode: 200,
        message: "Schools retrieved successfully",
        data: schools,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifySchool(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        throw new AppError("Status must be either 'approved' or 'rejected'", 400);
      }

      const id = Array.isArray(schoolId) ? schoolId[0] : schoolId;
      const school = await AdminService.verifySchoolDocument(id, status);

      ApiResponse.success({
        res,
        statusCode: 200,
        message: `School accreditation document ${status === "approved" ? "approved" : "rejected"} successfully`,
        data: school,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search } = req.query;
      const users = await AdminService.getAllUsers({
        role: role as string,
        search: search as string,
      });

      ApiResponse.success({
        res,
        statusCode: 200,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
