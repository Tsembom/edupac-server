import mongoose from "mongoose";
import { GuidanceRoadmap, type IGuidanceRoadmap } from "./guidance.model.js";
import { Connection } from "../connections/connection.model.js";
import { User } from "../users/user.model.js";
import { AppError } from "../../utils/appError.js";

export class GuidanceService {
  /**
   * Save or sync a student's latest AI recommendation roadmap
   */
  static async syncRoadmap(
    studentId: string,
    payload: {
      lastPrompt?: string;
      aiSummary: string;
      careers: any[];
      courses: any[];
      universities: any[];
      extractedContext?: any;
    }
  ): Promise<IGuidanceRoadmap> {
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    const roadmap = await GuidanceRoadmap.findOneAndUpdate(
      { studentId: studentObjId },
      {
        studentId: studentObjId,
        lastPrompt: payload.lastPrompt,
        aiSummary: payload.aiSummary,
        careers: payload.careers || [],
        courses: payload.courses || [],
        universities: payload.universities || [],
        extractedContext: payload.extractedContext,
      },
      { new: true, upsert: true }
    );

    return roadmap;
  }

  /**
   * Get a student's roadmap. Authorized for:
   * 1. The student themselves
   * 2. Any connected Parent or Counselor with status "accepted"
   */
  static async getStudentRoadmap(
    requesterId: string,
    targetStudentId: string
  ): Promise<{ roadmap: IGuidanceRoadmap | null; student: any }> {
    const targetObjId = new mongoose.Types.ObjectId(targetStudentId);
    const requesterObjId = new mongoose.Types.ObjectId(requesterId);

    const student = await User.findById(targetObjId).select(
      "name username email phoneNumber role schoolName avatarUrl bio headline"
    );

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    // If requester is not the student themselves, verify connection
    if (requesterId !== targetStudentId) {
      const isConnected = await Connection.findOne({
        $or: [
          { requesterId: requesterObjId, receiverId: targetObjId, status: "accepted" },
          { requesterId: targetObjId, receiverId: requesterObjId, status: "accepted" },
        ],
      });

      if (!isConnected) {
        throw new AppError(
          "You must have an active accepted connection to view this student's AI recommendations.",
          403
        );
      }
    }

    const roadmap = await GuidanceRoadmap.findOne({ studentId: targetObjId });

    return {
      roadmap,
      student,
    };
  }

  /**
   * Get my own roadmap
   */
  static async getMyRoadmap(userId: string): Promise<IGuidanceRoadmap | null> {
    return GuidanceRoadmap.findOne({ studentId: new mongoose.Types.ObjectId(userId) });
  }
}
