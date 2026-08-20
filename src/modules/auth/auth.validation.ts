import { z } from "zod";

const isCameroonPhone = (value: string): boolean => {
  if (!value) return false;
  const clean = value.replace(/[\s\-.()]/g, "");

  if (clean.startsWith("+237")) {
    const rest = clean.slice(4);
    return /^[236]\d{8}$/.test(rest);
  }

  if (clean.startsWith("237") && clean.length === 12) {
    const rest = clean.slice(3);
    return /^[236]\d{8}$/.test(rest);
  }

  return /^[236]\d{8}$/.test(clean);
};

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Full name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
      username: z
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      email: z
        .string({ required_error: "Email is required" })
        .email("Please enter a valid email address"),
      phoneNumber: z
        .string({ required_error: "Phone number is required" })
        .refine(
          (val) => isCameroonPhone(val),
          "Please provide a valid 9-digit Cameroonian phone number"
        ),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      role: z.enum(["student", "parent", "school"], {
        errorMap: () => ({ message: "Role must be student, parent, or school" }),
      }),
      schoolName: z.string().max(100).optional(),
      institutionType: z.string().max(50).optional(),
      designation: z.string().max(100).optional(),
      city: z.string().max(100).optional(),
      documentName: z.string().max(200).optional(),
      documentUrl: z.string().max(500).optional(),
      linkUsername: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "school") {
        if (!data.schoolName || data.schoolName.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "School name is required for school accounts",
            path: ["schoolName"],
          });
        }
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z
      .string({ required_error: "Email or username is required" })
      .min(1, "Please provide your email or username"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Please provide your password"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Please provide a refresh token"),
  }),
});
