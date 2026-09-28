import { z } from "zod";

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

const title = z
  .string({ error: "title is required and must be a string" })
  .trim()
  .min(1, "title must not be empty")
  .max(TITLE_MAX_LENGTH, `title must be at most ${TITLE_MAX_LENGTH} characters`);

const description = z
  .string({ error: "description must be a string" })
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `description must be at most ${DESCRIPTION_MAX_LENGTH} characters`);

const isCompleted = z.boolean({ error: "isCompleted must be a boolean" });

/** POST /tasks — only title is required. */
export const createTaskSchema = z.strictObject({
  title,
  description: description.default(""),
  isCompleted: isCompleted.default(false),
});

/** PUT /tasks/{id} — full replacement, every field is required. */
export const updateTaskSchema = z.strictObject({
  title,
  description: z
    .string({ error: "description is required and must be a string" })
    .trim()
    .max(DESCRIPTION_MAX_LENGTH, `description must be at most ${DESCRIPTION_MAX_LENGTH} characters`),
  isCompleted: z.boolean({ error: "isCompleted is required and must be a boolean" }),
});

export const taskIdParamSchema = z.object({
  id: z.coerce
    .number({ error: "id must be a number" })
    .int("id must be a positive integer")
    .positive("id must be a positive integer"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
