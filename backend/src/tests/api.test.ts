import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import { prisma } from "../utils/prisma.js";

describe("Forms API", () => {
  let formId: string;
  let fieldId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/forms creates a form", async () => {
    const res = await request(app)
      .post("/api/forms")
      .send({
        name: "Test Form",
        description: "Test",
        fields: [
          { label: "Name", type: "text", required: true, order: 0 },
          { label: "Agree", type: "checkbox", required: false, order: 1 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Form");
    expect(res.body.fields).toHaveLength(2);
    formId = res.body.id;
    fieldId = res.body.fields[0].id;
  });

  it("GET /api/forms lists forms", async () => {
    const res = await request(app).get("/api/forms");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /api/forms/:id returns form", async () => {
    const res = await request(app).get(`/api/forms/${formId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(formId);
  });

  it("POST /api/forms/:id/submissions creates submission", async () => {
    const res = await request(app)
      .post(`/api/forms/${formId}/submissions`)
      .send({
        values: [{ fieldId, value: "John" }],
      });

    expect(res.status).toBe(201);
    expect(res.body.values).toHaveLength(1);
  });

  it("PUT /api/forms/:id with submissions creates new version", async () => {
    const res = await request(app)
      .put(`/api/forms/${formId}`)
      .send({
        name: "Test Form v2",
        description: "Updated",
        fields: [
          { label: "Full Name", type: "text", required: true, order: 0 },
          { label: "Agree", type: "checkbox", required: false, order: 1 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(2);
    expect(res.body.id).not.toBe(formId);
  });

  it("GET /api/submissions/:id returns 404 for invalid id", async () => {
    const res = await request(app).get(
      "/api/submissions/00000000-0000-4000-8000-000000000000"
    );
    expect(res.status).toBe(404);
  });
});
