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
        throw new AppError("A pending connection request already exists between you", 400);
      }
      // If rejected, allow re-requesting by updating status to pending
      existing.requesterId = new mongoose.Types.ObjectId(requesterId);
      existing.receiverId = targetUser._id;
      existing.status = "pending";
      existing.note = note;
      await existing.save();

      const populated = await Connection.findById(existing._id)
        .populate("requesterId", "name username role avatarUrl profileHeadline schoolName")
        .populate("receiverId", "name username role avatarUrl profileHeadline schoolName");

      return populated || existing;
    }

    const created = await Connection.create({
      requesterId,
      receiverId: targetUser._id,
      status: "pending",
      note,
    });

    const populated = await Connection.findById(created._id)
      .populate("requesterId", "name username role avatarUrl profileHeadline schoolName")
      .populate("receiverId", "name username role avatarUrl profileHeadline schoolName");

    return populated || created;
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

    const populated = await Connection.findById(connection._id)
      .populate("requesterId", "name username role avatarUrl profileHeadline schoolName")
      .populate("receiverId", "name username role avatarUrl profileHeadline schoolName");

    return populated || connection;
  }

  static async getMyConnections(userId: string): Promise<IConnection[]> {
    return Connection.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
      status: "accepted",
    })
      .populate("requesterId", "name username role avatarUrl profileHeadline schoolName")
      .populate("receiverId", "name username role avatarUrl profileHeadline schoolName")
      .sort({ updatedAt: -1 });
  }

  static async getPendingRequests(userId: string): Promise<IConnection[]> {
    // Incoming pending requests (others requesting to connect with you)
    return Connection.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("requesterId", "name username role avatarUrl profileHeadline schoolName")
      .sort({ createdAt: -1 });
  }

  static async getSentRequests(userId: string): Promise<IConnection[]> {
    // Outgoing pending requests (requests you sent to others)
    return Connection.find({
      requesterId: userId,
      status: "pending",
    })
      .populate("receiverId", "name username role avatarUrl profileHeadline schoolName")
      .sort({ createdAt: -1 });
  }

  static async cancelOrRemove(connectionId: string, userId: string): Promise<void> {
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      throw new AppError("Connection not found", 404);
    }

    const isParticipant =
      connection.requesterId.toString() === userId ||
      connection.receiverId.toString() === userId;

    if (!isParticipant) {
      throw new AppError("Not authorized to remove this connection", 403);
    }

    await Connection.findByIdAndDelete(connectionId);

    // Remove from both connectedUsers sets
    await Promise.all([
      User.findByIdAndUpdate(connection.requesterId, {
        $pull: { connectedUsers: connection.receiverId },
      }),
      User.findByIdAndUpdate(connection.receiverId, {
        $pull: { connectedUsers: connection.requesterId },
      }),
    ]);
  }
}
