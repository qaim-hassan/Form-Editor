import { Router } from "express";
import * as submissionController from "../controllers/submissionController.js";
import { validateParams, idParamSchema } from "../middleware/validate.js";

const router = Router();

router.get("/:id", validateParams(idParamSchema), submissionController.getSubmission);

export default router;
