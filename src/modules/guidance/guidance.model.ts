import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGuidanceCareer {
  id?: number | string;
  name: string;
  domain?: string;
  score: number;
  reasons: string[];
}

export interface IGuidanceCourse {
  id?: number | string;
  name: string;
  score: number;
  duration?: string;
  reasons: string[];
}

export interface IGuidanceUniversity {
  id?: number | string;
  name: string;
  city?: string;
  region?: string;
  score: number;
  reasons: string[];
}

export interface IGuidanceReportCardGrade {
  subject: string;
  score: number;
  rawScore?: number;
  maxScore?: number;
  raw?: string;
}

export interface IGuidanceReportCard {
  filename: string;
  uploadedAt: Date;
  averageScore: number;
  academicStanding?: string;
  grades: IGuidanceReportCardGrade[];
}

export interface IGuidanceRoadmap extends Document {
  studentId: Types.ObjectId;
  lastPrompt?: string;
  aiSummary: string;
  careers: IGuidanceCareer[];
  courses: IGuidanceCourse[];
  universities: IGuidanceUniversity[];
  reportCard?: IGuidanceReportCard;
  extractedContext?: {
    scores?: Record<string, number>;
    interests?: string[];
    location?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GuidanceCareerSchema = new Schema<IGuidanceCareer>(
  {
    id: Schema.Types.Mixed,
    name: { type: String, required: true },
    domain: { type: String, default: "General" },
    score: { type: Number, required: true },
    reasons: [{ type: String }],
  },
  { _id: false }
);

const GuidanceCourseSchema = new Schema<IGuidanceCourse>(
  {
    id: Schema.Types.Mixed,
    name: { type: String, required: true },
    score: { type: Number, required: true },
    duration: { type: String },
    reasons: [{ type: String }],
  },
  { _id: false }
);

const GuidanceUniversitySchema = new Schema<IGuidanceUniversity>(
  {
    id: Schema.Types.Mixed,
    name: { type: String, required: true },
    city: { type: String },
    region: { type: String },
    score: { type: Number, required: true },
    reasons: [{ type: String }],
  },
  { _id: false }
);

const GuidanceReportCardGradeSchema = new Schema<IGuidanceReportCardGrade>(
  {
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    rawScore: { type: Number },
    maxScore: { type: Number },
    raw: { type: String },
  },
  { _id: false }
);

const GuidanceReportCardSchema = new Schema<IGuidanceReportCard>(
  {
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    averageScore: { type: Number, required: true },
    academicStanding: { type: String },
    grades: [GuidanceReportCardGradeSchema],
  },
  { _id: false }
);

const GuidanceRoadmapSchema = new Schema<IGuidanceRoadmap>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    lastPrompt: { type: String },
    aiSummary: { type: String, required: true },
    careers: [GuidanceCareerSchema],
    courses: [GuidanceCourseSchema],
    universities: [GuidanceUniversitySchema],
    reportCard: GuidanceReportCardSchema,
    extractedContext: {
      scores: { type: Map, of: Number },
      interests: [{ type: String }],
      location: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const GuidanceRoadmap = mongoose.model<IGuidanceRoadmap>(
  "GuidanceRoadmap",
  GuidanceRoadmapSchema
);
