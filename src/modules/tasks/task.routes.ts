import { Router } from "express";
import { validateBody, validateParams } from "../../middleware/validate";
import { TaskController } from "./task.controller";
import { TaskRepository } from "./task.repository";
import { createTaskSchema, taskIdParamSchema, updateTaskSchema } from "./task.schema";
import { TaskService } from "./task.service";

export function createTaskRouter(repository = new TaskRepository()): Router {
  const controller = new TaskController(new TaskService(repository));
  const router = Router();
  const withId = validateParams(taskIdParamSchema);

  router.get("/", controller.list);
  router.post("/", validateBody(createTaskSchema), controller.create);
  router.get("/:id", withId, controller.get);
  router.put("/:id", withId, validateBody(updateTaskSchema), controller.update);
  router.delete("/:id", withId, controller.remove);

  return router;
}
