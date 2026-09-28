import fs from "node:fs";
import path from "node:path";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { TaskRepository } from "./modules/tasks/task.repository";
import { createTaskRouter } from "./modules/tasks/task.routes";

const openApiPath = path.join(__dirname, "..", "docs", "openapi.yaml");

export function createApp(repository = new TaskRepository()) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/tasks", createTaskRouter(repository));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
