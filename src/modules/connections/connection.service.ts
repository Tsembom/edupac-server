import { Connection, IConnection } from "./connection.model.js";
import { User } from "../users/user.model.js";
import { AppError } from "../../utils/appError.js";
import mongoose from "mongoose";

export class ConnectionService {
  static async requestConnection(
    requesterId: string,
    targetUsername: string,
    note?: string
  ): Promise<IConnection> {
    const targetUser = await User.findOne({
      username: targetUsername.toLowerCase().trim(),
    });

    if (!targetUser) {
      throw new AppError(`User '@${targetUsername}' not found`, 404);
    }

    if (targetUser._id.toString() === requesterId) {
      throw new AppError("You cannot connect with your own account", 400);
    }

    // Check if a connection already exists
    const existing = await Connection.findOne({
      $or: [
        { requesterId, receiverId: targetUser._id },
        { requesterId: targetUser._id, receiverId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        throw new AppError("You are already connected with this user", 400);
      }
      if (existing.status === "pending") {
        throw new AppError("A pending connection request already exists", 400);
      }
      // If rejected, allow re-requesting by updating status to pending
      existing.requesterId = new mongoose.Types.ObjectId(requesterId);
      existing.receiverId = targetUser._id;
      existing.status = "pending";
      existing.note = note;
      return existing.save();
    }

    return Connection.create({
      requesterId,
      receiverId: targetUser._id,
      status: "pending",
      note,
    });
  }

  static async respondToRequest(
    connectionId: string,
    userId: string,
    status: "accepted" | "rejected"
  ): Promise<IConnection> {
    const connection = await Connection.findById(connectionId);

    if (!connection) {
      throw new AppError("Connection request not found", 404);
    }

    // Only the receiver can respond to the request
    if (connection.receiverId.toString() !== userId) {
      throw new AppError("You are not authorized to respond to this request", 403);
    }

    if (connection.status !== "pending") {
      throw new AppError(`This connection request is already ${connection.status}`, 400);
    }

    connection.status = status;
    await connection.save();

    if (status === "accepted") {
      // Add each user to the other's connectedUsers list
      await Promise.all([
        User.findByIdAndUpdate(connection.requesterId, {
          $addToSet: { connectedUsers: connection.receiverId },
        }),
        User.findByIdAndUpdate(connection.receiverId, {
          $addToSet: { connectedUsers: connection.requesterId },
        }),
      ]);
    }

    return connection;
  }

  static async getMyConnections(userId: string): Promise<IConnection[]> {
    return Connection.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
      status: "accepted",
    })
      .populate("requesterId", "name username role avatarUrl profileHeadline")
      .populate("receiverId", "name username role avatarUrl profileHeadline")
      .sort({ updatedAt: -1 });
  }

  static async getPendingRequests(userId: string): Promise<IConnection[]> {
    return Connection.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("requesterId", "name username role avatarUrl profileHeadline")
      .sort({ createdAt: -1 });
  }
}
