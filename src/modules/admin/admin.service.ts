import { User } from "../users/user.model.js";
import { AppError } from "../../utils/appError.js";

export class AdminService {
  /**
   * Get high-level platform statistics
   */
  static async getPlatformStats() {
    const [
      totalUsers,
      studentsCount,
      parentsCount,
      schoolsCount,
      pendingSchoolsCount,
      approvedSchoolsCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "parent" }),
      User.countDocuments({ role: "school" }),
      User.countDocuments({ role: "school", verificationStatus: "pending" }),
      User.countDocuments({ role: "school", verificationStatus: "approved" }),
    ]);

    return {
      totalUsers,
      studentsCount,
      parentsCount,
      schoolsCount,
      pendingSchoolsCount,
      approvedSchoolsCount,
    };
  }

  /**
   * List schools filtered by status (pending, approved, rejected, all)
   */
  static async getSchools(status?: string) {
    const query: Record<string, any> = { role: "school" };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.verificationStatus = status;
    }

    return User.find(query)
      .select("name username email phoneNumber schoolName institutionType city documentName documentUrl verificationStatus isVerified createdAt")
      .sort({ createdAt: -1 });
  }

  /**
   * Verify or reject a partner school's official accreditation document
   */
  static async verifySchoolDocument(schoolId: string, status: "approved" | "rejected") {
    const school = await User.findOne({ _id: schoolId, role: "school" });
    if (!school) {
      throw new AppError("School account not found", 404);
    }

    school.verificationStatus = status;
    school.isVerified = status === "approved";
    await school.save();

    return school;
  }

  /**
   * Get all registered users with role filtering and search
   */
  static async getAllUsers(filters?: { role?: string; search?: string }) {
    const query: Record<string, any> = {};

    if (filters?.role && ["student", "parent", "school", "admin"].includes(filters.role)) {
      query.role = filters.role;
    }

    if (filters?.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), "i");
      query.$or = [{ name: regex }, { username: regex }, { email: regex }, { schoolName: regex }];
    }

    return User.find(query)
      .select("name username email phoneNumber role schoolName city verificationStatus isVerified createdAt")
      .sort({ createdAt: -1 })
      .limit(100);
  }
}
