import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";
import mongoose from "mongoose";

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Mongoose Bad ObjectId CastError
  if (err instanceof mongoose.Error.CastError) {
    error = new AppError(`Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if ((err as MongoDuplicateKeyError).code === 11000) {
    const field = Object.keys((err as MongoDuplicateKeyError).keyValue || {})[0] || "field";
    const value = (err as MongoDuplicateKeyError).keyValue?.[field];
    error = new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use. Please use another value.`,
      409
    );
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError("Invalid input data", 422, messages);
  }

  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: (error as AppError).errors || undefined,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
