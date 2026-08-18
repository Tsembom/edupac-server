import mongoose, { Document, Schema } from "mongoose";

export interface IConnection extends Document {
  requesterId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    note: {
      type: String,
      maxlength: [200, "Note cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per pair
connectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });

export const Connection = mongoose.model<IConnection>(
  "Connection",
  connectionSchema
);
