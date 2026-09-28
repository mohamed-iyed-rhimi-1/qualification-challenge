import type { Task } from "./task.model";

type TaskData = Omit<Task, "id">;

/** In-memory storage. Swapping this for a real database only touches this file. */
export class TaskRepository {
  private readonly tasks = new Map<number, Task>();
  private nextId = 1;

  findAll(): Task[] {
    return [...this.tasks.values()];
  }

  findById(id: number): Task | undefined {
    return this.tasks.get(id);
  }

  create(data: TaskData): Task {
    const task: Task = { id: this.nextId++, ...data };
    this.tasks.set(task.id, task);
    return task;
  }

  update(id: number, data: TaskData): Task | undefined {
    if (!this.tasks.has(id)) return undefined;
    const task: Task = { id, ...data };
    this.tasks.set(id, task);
    return task;
  }

  delete(id: number): boolean {
    return this.tasks.delete(id);
  }
}
