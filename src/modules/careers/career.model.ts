import mongoose, { Document, Schema } from "mongoose";

export interface ICareerRole extends Document {
  title: string;
  slug: string;
  category: string;
  matchScore: number;
  description: string;
  salaryRange: string;
  growthRate: string;
  skills: string[];
  educationLevel?: string;
  overview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const careerRoleSchema = new Schema<ICareerRole>(
  {
    title: {
      type: String,
      required: [true, "Career title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Career category is required"],
      trim: true,
      index: true,
    },
    matchScore: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    salaryRange: {
      type: String,
      required: [true, "Salary range is required"],
    },
    growthRate: {
      type: String,
      required: [true, "Growth rate is required"],
    },
    skills: {
      type: [String],
      required: true,
      index: true,
    },
    educationLevel: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CareerRole = mongoose.model<ICareerRole>(
  "CareerRole",
  careerRoleSchema
);
