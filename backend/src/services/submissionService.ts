import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";
import { sanitizeString } from "../utils/sanitize.js";
import type { CreateSubmissionInput } from "../utils/validation.js";
import {
  getFormById,
  getRootId,
  getTemplateFamilyIds,
  resolveSubmissionTemplateId,
} from "./formService.js";

function validateSubmissionValues(
  fields: { id: string; type: string; required: boolean; label: string }[],
  values: CreateSubmissionInput["values"]
) {
  const fieldMap = new Map(fields.map((f) => [f.id, f]));
  const errors: string[] = [];

  for (const field of fields) {
    const submitted = values.find((v) => v.fieldId === field.id);
    const raw = submitted?.value ?? "";

    if (field.required && !raw.trim()) {
      errors.push(`"${field.label}" is required`);
      continue;
    }

    if (!raw.trim()) continue;

    switch (field.type) {
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(raw)) errors.push(`"${field.label}" must be a valid email`);
        break;
      }
      case "number": {
        if (Number.isNaN(Number(raw))) errors.push(`"${field.label}" must be a number`);
        break;
      }
      case "date": {
        if (Number.isNaN(Date.parse(raw))) errors.push(`"${field.label}" must be a valid date`);
        break;
      }
      case "checkbox": {
        if (!["true", "false"].includes(raw.toLowerCase())) {
          errors.push(`"${field.label}" must be true or false`);
        }
        break;
      }
    }
  }

  for (const v of values) {
    if (!fieldMap.has(v.fieldId)) {
      errors.push(`Unknown field: ${v.fieldId}`);
    }
  }

  if (errors.length) {
    throw new AppError(400, "Submission validation failed", errors);
  }
}

export async function listSubmissions(formTemplateId: string) {
  const form = await getFormById(formTemplateId);
  const rootId = getRootId(form);
  const familyIds = await getTemplateFamilyIds(rootId);
  return prisma.formSubmission.findMany({
    where: { formTemplateId: { in: familyIds } },
    include: {
      values: {
        include: { field: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSubmission(
  formTemplateId: string,
  input: CreateSubmissionInput
) {
  const targetId = await resolveSubmissionTemplateId(formTemplateId);
  const form = await getFormById(targetId);

  validateSubmissionValues(form.fields, input.values);

  return prisma.formSubmission.create({
    data: {
      formTemplateId: targetId,
      values: {
        create: input.values.map((v) => ({
          fieldId: v.fieldId,
          value: sanitizeString(v.value),
        })),
      },
    },
    include: {
      values: { include: { field: true } },
      formTemplate: { include: { fields: { orderBy: { order: "asc" } } } },
    },
  });
}

export async function getSubmissionById(id: string) {
  const submission = await prisma.formSubmission.findUnique({
    where: { id },
    include: {
      values: { include: { field: true } },
      formTemplate: { include: { fields: { orderBy: { order: "asc" } } } },
    },
  });
  if (!submission) throw new AppError(404, "Submission not found");
  return submission;
}
