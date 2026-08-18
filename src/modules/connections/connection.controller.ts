import { Request, Response, NextFunction } from "express";
import { ConnectionService } from "./connection.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";

export class ConnectionController {
  static async requestConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const { targetUsername, note } = req.body;
      const connection = await ConnectionService.requestConnection(
        req.user._id.toString(),
        targetUsername,
        note
      );

      ApiResponse.created({
        res,
        message: `Connection request sent to @${targetUsername}`,
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  static async respondToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const connectionId = req.params.connectionId as string;
      const { status } = req.body;

      const connection = await ConnectionService.respondToRequest(
        connectionId,
        req.user._id.toString(),
        status
      );

      ApiResponse.success({
        res,
        message: `Connection request ${status}`,
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const connections = await ConnectionService.getMyConnections(
        req.user._id.toString()
      );

      ApiResponse.success({
        res,
        data: connections,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const pending = await ConnectionService.getPendingRequests(
        req.user._id.toString()
      );

      ApiResponse.success({
        res,
        data: pending,
      });
    } catch (error) {
      next(error);
    }
  }
}
