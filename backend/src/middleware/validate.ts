import type { RequestHandler } from "express";
import { z, type ZodSchema } from "zod";
import { AppError } from "../utils/errors.js";

export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(400, "Validation failed", result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export function validateParams(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new AppError(400, "Invalid parameters", result.error.flatten()));
      return;
    }
    req.params = result.data as typeof req.params;
    next();
  };
}
