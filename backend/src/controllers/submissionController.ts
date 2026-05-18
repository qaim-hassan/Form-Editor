import type { Request, Response, NextFunction } from "express";
import * as submissionService from "../services/submissionService.js";

export async function listSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const submissions = await submissionService.listSubmissions(id as string);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

export async function createSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const submission = await submissionService.createSubmission(id as string, req.body);
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
}

export async function getSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const submission = await submissionService.getSubmissionById(id as string);
    res.json(submission);
  } catch (err) {
    next(err);
  }
}
