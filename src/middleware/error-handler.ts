import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../errors/http-error";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  // Errors raised by express.json() (malformed JSON, payload too large, ...)
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ status: 400, error: "Malformed JSON in request body" });
    return;
  }
  if (typeof err?.status === "number" && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ status: err.status, error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ status: 500, error: "Internal server error" });
};
