import { z } from "zod";
import type { FormField } from "@/types";

export const fieldTypes = [
  "text",
  "textarea",
  "number",
  "email",
  "date",
  "select",
  "checkbox",
] as const;

export const builderFieldSchema = z.object({
  clientId: z.string(),
  label: z.string().min(1, "Label is required"),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(z.string().min(1)).optional(),
  order: z.number(),
});

export const builderFormSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  fields: z.array(builderFieldSchema).min(1, "Add at least one field"),
});

function normalizeCheckboxValue(val: unknown): "true" | "false" {
  if (val === true || val === "true" || val === "on") return "true";
  return "false";
}

export function buildSubmissionSchema(
  fields: FormField[]
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!field.id) continue;
    const requiredMsg = `${field.label} is required`;

    if (field.type === "checkbox") {
      shape[field.id] = z.preprocess(
        normalizeCheckboxValue,
        z.enum(["true", "false"], {
          errorMap: () => ({ message: requiredMsg }),
        })
      );
      continue;
    }

    switch (field.type) {
      case "email":
        shape[field.id] = field.required
          ? z.string().min(1, requiredMsg).email("Invalid email")
          : z.union([z.literal(""), z.string().email("Invalid email")]);
        break;
      case "number":
        shape[field.id] = field.required
          ? z
              .string()
              .min(1, requiredMsg)
              .refine((v) => !Number.isNaN(Number(v)), "Must be a number")
          : z.string().refine((v) => v === "" || !Number.isNaN(Number(v)), "Must be a number");
        break;
      case "date":
        shape[field.id] = field.required
          ? z
              .string()
              .min(1, requiredMsg)
              .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date")
          : z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Invalid date");
        break;
      default:
        shape[field.id] = field.required
          ? z.string().min(1, requiredMsg)
          : z.string();
        break;
    }
  }

  return z.object(shape);
}
// ok