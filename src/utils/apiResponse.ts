import { Response } from "express";

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>({
    res,
    statusCode = 200,
    message = "Operation successful",
    data,
    meta,
  }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static created<T>({
    res,
    statusCode = 201,
    message = "Resource created successfully",
    data,
  }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
