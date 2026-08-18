import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await UserService.getMe(req.user._id.toString());

      ApiResponse.success({
        res,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username as string;
      const user = await UserService.getByUsername(username);

      ApiResponse.success({
        res,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const updatedUser = await UserService.updateProfile(
        req.user._id.toString(),
        req.body
      );

      ApiResponse.success({
        res,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || "";
      const users = await UserService.searchUsers(
        q,
        req.user?._id.toString()
      );

      ApiResponse.success({
        res,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
