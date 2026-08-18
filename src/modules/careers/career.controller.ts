import { Request, Response, NextFunction } from "express";
import { CareerService } from "./career.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class CareerController {
  static async getAllCareers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, skill, search, limit, page } = req.query;
      const result = await CareerService.getAllCareers({
        category: typeof category === "string" ? category : undefined,
        skill: typeof skill === "string" ? skill : undefined,
        search: typeof search === "string" ? search : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
      });

      ApiResponse.success({
        res,
        data: result.careers,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCareerByIdOrSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idOrSlug = req.params.idOrSlug as string;
      const career = await CareerService.getCareerByIdOrSlug(idOrSlug);

      ApiResponse.success({
        res,
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCareer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const career = await CareerService.createCareer(req.body);

      ApiResponse.created({
        res,
        message: "Career pathway created successfully",
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }
}
