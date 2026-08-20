import { User, IUser } from "../users/user.model.js";
import { Connection } from "../connections/connection.model.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/appError.js";

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: "student" | "parent" | "school" | "admin";
  schoolName?: string;
  institutionType?: string;
  designation?: string;
  city?: string;
  documentName?: string;
  documentUrl?: string;
  linkUsername?: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthTokens> {
    const existingEmail = await User.findOne({ email: input.email.toLowerCase() });
    if (existingEmail) {
      throw new AppError("Email is already registered. Please log in.", 409);
    }

    const existingUsername = await User.findOne({ username: input.username.toLowerCase() });
    if (existingUsername) {
      throw new AppError("Username is already taken. Please choose another.", 409);
    }

    const hashedPassword = await hashPassword(input.password);

    const isSchool = input.role === "school";

    const user = await User.create({
      name: input.name,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      phoneNumber: input.phoneNumber,
      password: hashedPassword,
      role: input.role,
      schoolName: input.schoolName,
      institutionType: input.institutionType,
      designation: input.designation,
      city: input.city,
      documentName: input.documentName,
      documentUrl: input.documentUrl,
      isVerified: !isSchool,
      verificationStatus: isSchool ? "pending" : "approved",
    });

    // Handle optional initial account linking
    if (input.linkUsername && input.linkUsername.trim() !== "") {
      const targetUser = await User.findOne({
        username: input.linkUsername.trim().toLowerCase(),
      });

      if (targetUser && targetUser._id.toString() !== user._id.toString()) {
        await Connection.create({
          requesterId: user._id,
          receiverId: targetUser._id,
          status: "pending",
          note: `Connection requested during onboarding by @${user.username} (${user.role})`,
        });
      }
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      username: user.username,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  static async login(input: LoginInput): Promise<AuthTokens> {
    const identifier = input.emailOrUsername.toLowerCase().trim();

    // Query by email OR username, explicitly selecting password
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      throw new AppError("Invalid email/username or password", 401);
    }

    const isMatch = await comparePassword(input.password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid email/username or password", 401);
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      username: user.username,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  static async refresh(token: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError("User belonging to this token no longer exists", 401);
    }

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      username: user.username,
    });

    return { accessToken: newAccessToken };
  }

  static async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    return this.refresh(token);
  }
}
