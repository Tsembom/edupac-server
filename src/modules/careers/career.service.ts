import { CareerRole, ICareerRole } from "./career.model.js";
import { AppError } from "../../utils/appError.js";

export interface CareerFilterOptions {
  category?: string;
  skill?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export class CareerService {
  static async getAllCareers(options: CareerFilterOptions): Promise<{
    careers: ICareerRole[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { category, skill, search, limit = 20, page = 1 } = options;
    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = new RegExp(category, "i");
    }

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { skills: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const [careers, total] = await Promise.all([
      CareerRole.find(filter).sort({ matchScore: -1 }).skip(skip).limit(limit),
      CareerRole.countDocuments(filter),
    ]);

    return {
      careers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getCareerByIdOrSlug(idOrSlug: string): Promise<ICareerRole> {
    const career = await CareerRole.findOne({
      $or: [{ _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }, { slug: idOrSlug.toLowerCase() }],
    });

    if (!career) {
      throw new AppError("Career pathway not found", 404);
    }
    return career;
  }

  static async createCareer(input: Partial<ICareerRole>): Promise<ICareerRole> {
    const slug = input.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "";
    const existing = await CareerRole.findOne({ slug });

    if (existing) {
      throw new AppError("A career role with this title/slug already exists", 409);
    }

    return CareerRole.create({ ...input, slug });
  }
}
