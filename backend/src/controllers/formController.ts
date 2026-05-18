import type { Request, Response, NextFunction } from "express";
import * as formService from "../services/formService.js";

export async function listForms(_req: Request, res: Response, next: NextFunction) {
  try {
    const forms = await formService.listLatestForms();
    res.json(forms);
  } catch (err) {
    next(err);
  }
}

export async function getForm(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const form = await formService.getFormById(id as string);
    res.json(form);
  } catch (err) {
    next(err);
  }
}

export async function createForm(req: Request, res: Response, next: NextFunction) {
  try {
    const form = await formService.createForm(req.body);
    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
}

export async function updateForm(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const form = await formService.updateForm(id as string, req.body);
    res.json(form);
  } catch (err) {
    next(err);
  }
}

export async function deleteForm(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await formService.deleteForm(id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
