import { z } from "zod";

export const createConnectionSchema = z.object({
  body: z.object({
    targetUsername: z
      .string({ required_error: "Target username is required" })
      .min(1, "Target username cannot be empty"),
    note: z.string().max(200, "Note cannot exceed 200 characters").optional(),
  }),
});

export const respondConnectionSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected"], {
      errorMap: () => ({ message: "Status must be either accepted or rejected" }),
    }),
  }),
  params: z.object({
    connectionId: z.string().min(1, "Connection ID is required"),
  }),
});
