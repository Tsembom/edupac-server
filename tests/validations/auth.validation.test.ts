import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
} from "../../src/modules/auth/auth.validation.js";

describe("Auth Validation Schemas (Zod)", () => {
  describe("Registration Schema", () => {
    it("should accept valid Student registration payload with Cameroon phone", () => {
      const studentData = {
        name: "Paul Biya Jr",
        username: "paul_biya",
        email: "paul@example.cm",
        phoneNumber: "670 12 34 56",
        password: "securePassword123",
        role: "student",
      };

      const result = registerSchema.safeParse({ body: studentData });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.username).toBe("paul_biya");
      }
    });

    it("should accept valid School Counselor registration with institutional fields", () => {
      const schoolData = {
        name: "Dr. Marie Claire",
        username: "dean_marie",
        email: "marie@ubuea.cm",
        phoneNumber: "699 88 77 66",
        password: "securePassword123",
        role: "school",
        schoolName: "University of Buea",
        institutionType: "University / Higher Education",
        designation: "Academic Dean",
        city: "Buea, South West",
      };

      const result = registerSchema.safeParse({ body: schoolData });
      expect(result.success).toBe(true);
    });

    it("should fail School registration when schoolName is missing", () => {
      const invalidSchoolData = {
        name: "Dr. Marie Claire",
        username: "dean_marie",
        email: "marie@ubuea.cm",
        phoneNumber: "699 88 77 66",
        password: "securePassword123",
        role: "school",
        // missing schoolName
        institutionType: "University",
        designation: "Dean",
      };

      const result = registerSchema.safeParse({ body: invalidSchoolData });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorFields = result.error.errors.map((e) => e.path.join("."));
        expect(errorFields.some((f) => f.includes("schoolName"))).toBe(true);
      }
    });

    it("should fail when phone number is not a valid 9-digit Cameroonian number", () => {
      const invalidPhoneData = {
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com",
        phoneNumber: "123456", // too short, invalid prefix
        password: "securePassword123",
        role: "student",
      };

      const result = registerSchema.safeParse({ body: invalidPhoneData });
      expect(result.success).toBe(false);
    });

    it("should fail when username has invalid characters (e.g. spaces or symbols)", () => {
      const invalidUsernameData = {
        name: "John Doe",
        username: "john doe with spaces",
        email: "john@example.com",
        phoneNumber: "670 12 34 56",
        password: "securePassword123",
        role: "student",
      };

      const result = registerSchema.safeParse({ body: invalidUsernameData });
      expect(result.success).toBe(false);
    });
  });

  describe("Login Schema", () => {
    it("should accept valid email/username and password", () => {
      const validLogin = {
        emailOrUsername: "alex_smith",
        password: "password123",
      };

      const result = loginSchema.safeParse({ body: validLogin });
      expect(result.success).toBe(true);
    });

    it("should fail when password is empty", () => {
      const shortPasswordLogin = {
        emailOrUsername: "alex_smith",
        password: "",
      };

      const result = loginSchema.safeParse({ body: shortPasswordLogin });
      expect(result.success).toBe(false);
    });
  });
});
