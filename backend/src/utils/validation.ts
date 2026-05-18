import { z } from "zod";

export const fieldTypes = [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "select",
  "checkbox",
] as const;

export const fieldSchema = z.object({
  label: z.string().min(1).max(200),
  type: z.enum(fieldTypes),
  required: z.boolean().default(false),
  placeholder: z.string().max(500).optional().nullable(),
  helpText: z.string().max(500).optional().nullable(),
  options: z.array(z.string().min(1)).optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  fields: z.array(fieldSchema).min(1),
});

export const updateFormSchema = createFormSchema;

export const submissionValueSchema = z.object({
  fieldId: z.string().uuid(),
  value: z.string(),
});

export const createSubmissionSchema = z.object({
  values: z.array(submissionValueSchema).min(1),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
