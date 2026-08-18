import { User, IUser } from "./user.model.js";
import { AppError } from "../../utils/appError.js";

export interface UpdateProfileInput {
  name?: string;
  phoneNumber?: string;
  profileHeadline?: string;
  bio?: string;
  avatarUrl?: string;
  schoolName?: string;
  targetCareerId?: string;
  skills?: string[];
}

export class UserService {
  static async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId)
      .populate("targetCareerId")
      .populate("connectedUsers", "name username role avatarUrl schoolName");

    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async getByUsername(username: string): Promise<Partial<IUser>> {
    const user = await User.findOne({ username: username.toLowerCase() })
      .select("name username role avatarUrl profileHeadline skills schoolName")
      .populate("targetCareerId", "title category matchScore");

    if (!user) {
      throw new AppError(`User '@${username}' not found`, 404);
    }
    return user;
  }

  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  static async searchUsers(query: string, excludeUserId?: string): Promise<IUser[]> {
    const regex = new RegExp(query, "i");
    const filter: Record<string, unknown> = {
      $or: [{ name: regex }, { username: regex }, { schoolName: regex }],
    };

    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }

    return User.find(filter)
      .select("name username role avatarUrl profileHeadline schoolName")
      .limit(20);
  }
}
