import { Router } from "express";
import * as formController from "../controllers/formController.js";
import * as submissionController from "../controllers/submissionController.js";
import { validateBody, validateParams, idParamSchema } from "../middleware/validate.js";
import {
  createFormSchema,
  updateFormSchema,
  createSubmissionSchema,
} from "../utils/validation.js";

const router = Router();

router.get("/", formController.listForms);
router.get("/:id", validateParams(idParamSchema), formController.getForm);
router.post("/", validateBody(createFormSchema), formController.createForm);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateFormSchema),
  formController.updateForm
);
router.delete("/:id", validateParams(idParamSchema), formController.deleteForm);

router.get(
  "/:id/submissions",
  validateParams(idParamSchema),
  submissionController.listSubmissions
);
router.post(
  "/:id/submissions",
  validateParams(idParamSchema),
  validateBody(createSubmissionSchema),
  submissionController.createSubmission
);

export default router;
