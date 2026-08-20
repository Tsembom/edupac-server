import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../../utils/jwt.js";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: UserRole;
  profileHeadline?: string;
  bio?: string;
  avatarUrl?: string;
  schoolName?: string;
  institutionType?: string;
  designation?: string;
  city?: string;
  targetCareerId?: mongoose.Types.ObjectId;
  skills: string[];
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  documentName?: string;
  documentUrl?: string;
  connectedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["student", "parent", "school", "admin"],
      default: "student",
      index: true,
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: [100, "School name cannot exceed 100 characters"],
    },
    institutionType: {
      type: String,
      trim: true,
      maxlength: [50, "Institution type cannot exceed 50 characters"],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    profileHeadline: {
      type: String,
      trim: true,
      maxlength: [100, "Headline cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    targetCareerId: {
      type: Schema.Types.ObjectId,
      ref: "CareerRole",
    },
    skills: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    documentName: {
      type: String,
      trim: true,
    },
    documentUrl: {
      type: String,
      trim: true,
    },
    connectedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
