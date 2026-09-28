import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp();
});

const createTask = (body: object = { title: "Write tests", description: "Cover every endpoint" }) =>
  request(app).post("/tasks").send(body);

describe("POST /tasks", () => {
  it("creates a task with defaults and returns 201 + Location", async () => {
    const res = await createTask({ title: "  Write tests  " });

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/tasks/1");
    expect(res.body).toEqual({ id: 1, title: "Write tests", description: "", isCompleted: false });
  });

  it("assigns incrementing ids", async () => {
    await createTask();
    const res = await createTask();
    expect(res.body.id).toBe(2);
  });

  it.each([
    [{}, "title"],
    [{ title: "   " }, "title"],
    [{ title: 42 }, "title"],
    [{ title: "x".repeat(101) }, "title"],
    [{ title: "ok", description: "x".repeat(501) }, "description"],
    [{ title: "ok", isCompleted: "yes" }, "isCompleted"],
    [{ title: "ok", priority: "high" }, "priority"],
  ])("rejects invalid body %j with 400", async (body, field) => {
    const res = await createTask(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details.map((d: { field: string }) => d.field)).toContain(field);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app).post("/tasks").set("Content-Type", "application/json").send('{"title": ');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Malformed JSON in request body");
  });

  it("rejects a missing / non-object body with 400", async () => {
    expect((await request(app).post("/tasks")).status).toBe(400);
    expect((await createTask([{ title: "a" }])).status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("returns an empty list initially", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all created tasks", async () => {
    await createTask({ title: "A" });
    await createTask({ title: "B" });

    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(["A", "B"]);
  });
});

describe("GET /tasks/:id", () => {
  it("returns the task", async () => {
    const { body: created } = await createTask();
    const res = await request(app).get(`/tasks/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/tasks/999");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 404, error: "Task with id 999 not found" });
  });

  it.each(["abc", "0", "-1", "1.5"])("returns 400 for invalid id %s", async (id) => {
    const res = await request(app).get(`/tasks/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe("id");
  });
});

describe("PUT /tasks/:id", () => {
  const replacement = { title: "Updated", description: "New description", isCompleted: true };

  it("replaces the task", async () => {
    const { body: created } = await createTask();
    const res = await request(app).put(`/tasks/${created.id}`).send(replacement);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: created.id, ...replacement });
    expect((await request(app).get(`/tasks/${created.id}`)).body).toEqual(res.body);
  });

  it("requires every field", async () => {
    const { body: created } = await createTask();
    const res = await request(app).put(`/tasks/${created.id}`).send({ title: "Only title" });

    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["description", "isCompleted"]));
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).put("/tasks/999").send(replacement);
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid id", async () => {
    const res = await request(app).put("/tasks/abc").send(replacement);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /tasks/:id", () => {
  it("deletes the task and returns 204", async () => {
    const { body: created } = await createTask();

    const res = await request(app).delete(`/tasks/${created.id}`);
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect((await request(app).get(`/tasks/${created.id}`)).status).toBe(404);
  });

  it("returns 404 when deleting twice", async () => {
    const { body: created } = await createTask();
    await request(app).delete(`/tasks/${created.id}`);
    expect((await request(app).delete(`/tasks/${created.id}`)).status).toBe(404);
  });
});

describe("misc", () => {
  it("returns 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route GET /nope not found");
  });

  it("serves the OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.paths)).toEqual(["/tasks", "/tasks/{id}"]);
  });
});
