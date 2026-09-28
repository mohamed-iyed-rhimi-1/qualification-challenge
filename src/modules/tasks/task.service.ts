import { HttpError } from "../../errors/http-error";
import type { Task } from "./task.model";
import type { TaskRepository } from "./task.repository";
import type { CreateTaskInput, UpdateTaskInput } from "./task.schema";

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  list(): Task[] {
    return this.repository.findAll();
  }

  get(id: number): Task {
    const task = this.repository.findById(id);
    if (!task) throw HttpError.notFound(`Task with id ${id} not found`);
    return task;
  }

  create(input: CreateTaskInput): Task {
    return this.repository.create(input);
  }

  update(id: number, input: UpdateTaskInput): Task {
    const task = this.repository.update(id, input);
    if (!task) throw HttpError.notFound(`Task with id ${id} not found`);
    return task;
  }

  remove(id: number): void {
    if (!this.repository.delete(id)) throw HttpError.notFound(`Task with id ${id} not found`);
  }
}
