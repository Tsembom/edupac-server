import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../src/utils/password.js";

describe("Password Hashing & Comparison Utilities", () => {
  const plainPassword = "SuperSecurePassword123!";

  it("should hash plain password and produce salted bcrypt string", async () => {
    const hash = await hashPassword(plainPassword);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(plainPassword);
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("should return true when comparing correct password with hash", async () => {
    const hash = await hashPassword(plainPassword);
    const isMatch = await comparePassword(plainPassword, hash);
    expect(isMatch).toBe(true);
  });

  it("should return false when comparing incorrect password with hash", async () => {
    const hash = await hashPassword(plainPassword);
    const isMatch = await comparePassword("WrongPassword123", hash);
    expect(isMatch).toBe(false);
  });
});
