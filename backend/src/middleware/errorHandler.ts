import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      error: "Database unavailable. Start PostgreSQL and run: npx prisma migrate deploy",
      details: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};
