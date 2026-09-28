import type { RequestHandler } from "express";
import type { ZodType, z } from "zod";
import { HttpError, type ErrorDetail } from "../errors/http-error";

function toDetails(error: z.ZodError): ErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || (issue.code === "unrecognized_keys" ? issue.keys.join(", ") : "body"),
    message: issue.message,
  }));
}

/** Validates and normalises req.body (trimmed strings, defaults applied). */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    if (req.body === undefined || req.body === null || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(HttpError.badRequest("Request body must be a JSON object"));
    }
    const result = schema.safeParse(req.body);
    if (!result.success) return next(HttpError.badRequest("Validation failed", toDetails(result.error)));
    req.body = result.data;
    next();
  };
}

/** Validates route params; the parsed values are exposed on res.locals.params. */
export function validateParams(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) return next(HttpError.badRequest("Invalid path parameter", toDetails(result.error)));
    res.locals.params = result.data;
    next();
  };
}
