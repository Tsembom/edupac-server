import { describe, it, expect } from "vitest";
import {
  createConnectionSchema,
  respondConnectionSchema,
} from "../../src/modules/connections/connection.validation.js";

describe("Connection Validation Schemas (Zod)", () => {
  it("should accept valid connection request targetUsername", () => {
    const validPayload = {
      targetUsername: "counselor_sam",
      note: "Hi! I would like to connect for university advice.",
    };

    const result = createConnectionSchema.safeParse({ body: validPayload });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.targetUsername).toBe("counselor_sam");
    }
  });

  it("should strip leading @ from targetUsername if provided", () => {
    const payloadWithAt = {
      targetUsername: "@counselor_sam",
    };

    const result = createConnectionSchema.safeParse({ body: payloadWithAt });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.targetUsername).toBe("counselor_sam");
    }
  });

  it("should accept valid respond status ('accepted' | 'rejected')", () => {
    const acceptResult = respondConnectionSchema.safeParse({
      body: { status: "accepted" },
      params: { connectionId: "6482fb3a9011122233344455" },
    });
    expect(acceptResult.success).toBe(true);

    const rejectResult = respondConnectionSchema.safeParse({
      body: { status: "rejected" },
      params: { connectionId: "6482fb3a9011122233344455" },
    });
    expect(rejectResult.success).toBe(true);
  });

  it("should fail when respond status is invalid", () => {
    const invalidResult = respondConnectionSchema.safeParse({
      body: { status: "maybe" },
      params: { connectionId: "6482fb3a9011122233344455" },
    });
    expect(invalidResult.success).toBe(false);
  });
});
