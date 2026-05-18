import type { Request, Response, NextFunction } from "express";
import * as submissionService from "../services/submissionService.js";

export async function listSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const submissions = await submissionService.listSubmissions(req.params.id);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

export async function createSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await submissionService.createSubmission(req.params.id, req.body);
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
}

export async function getSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await submissionService.getSubmissionById(req.params.id);
    res.json(submission);
  } catch (err) {
    next(err);
  }
}
