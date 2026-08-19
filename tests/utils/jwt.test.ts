import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type TokenPayload,
} from "../../src/utils/jwt.js";

describe("JWT Utility Functions", () => {
  const samplePayload: TokenPayload = {
    userId: "507f1f77bcf86cd799439011",
    role: "student",
    username: "test_student",
  };

  it("should generate and successfully verify an access token", () => {
    const token = signAccessToken(samplePayload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(samplePayload.userId);
    expect(decoded.role).toBe(samplePayload.role);
    expect(decoded.username).toBe(samplePayload.username);
  });

  it("should generate and successfully verify a refresh token", () => {
    const refreshToken = signRefreshToken(samplePayload);
    expect(typeof refreshToken).toBe("string");

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(samplePayload.userId);
    expect(decoded.username).toBe(samplePayload.username);
  });

  it("should throw an error for an invalid/tampered token", () => {
    const invalidToken = "invalid.token.structure";
    expect(() => verifyAccessToken(invalidToken)).toThrow();
  });
});
