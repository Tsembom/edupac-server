import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      ApiResponse.created({
        res,
        message: "Account registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      ApiResponse.success({
        res,
        message: "Logged in successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);

      ApiResponse.success({
        res,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
