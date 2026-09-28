import type { Request, Response } from "express";
import type { TaskService } from "./task.service";
import type { CreateTaskInput, UpdateTaskInput } from "./task.schema";

type IdParams = { id: number };

export class TaskController {
  constructor(private readonly service: TaskService) {}

  list = (_req: Request, res: Response) => {
    res.status(200).json(this.service.list());
  };

  get = (_req: Request, res: Response) => {
    const { id } = res.locals.params as IdParams;
    res.status(200).json(this.service.get(id));
  };

  create = (req: Request, res: Response) => {
    const task = this.service.create(req.body as CreateTaskInput);
    res.status(201).location(`${req.baseUrl}/${task.id}`).json(task);
  };

  update = (req: Request, res: Response) => {
    const { id } = res.locals.params as IdParams;
    res.status(200).json(this.service.update(id, req.body as UpdateTaskInput));
  };

  remove = (_req: Request, res: Response) => {
    const { id } = res.locals.params as IdParams;
    this.service.remove(id);
    res.status(204).end();
  };
}
