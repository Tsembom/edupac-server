import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("API Health & Middleware Integration Tests", () => {
  const app = createApp();

  it("GET / should return operational status and version", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Edupac Backend API is operational");
    expect(res.body.data.version).toBe("1.0.0");
  });

  it("GET /api/v1/health should return health check timestamp and uptime", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API service is healthy");
    expect(res.body.data.uptime).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
  });

  it("GET /unknown-route should return 404 AppError JSON", async () => {
    const res = await request(app).get("/api/v1/nonexistent-endpoint-test");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Cannot find endpoint /api/v1/nonexistent-endpoint-test");
  });
});
