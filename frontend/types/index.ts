export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "select"
  | "checkbox";

export interface FormField {
  id?: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string | null;
  helpText?: string | null;
  options?: string[] | null;
  order: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  description?: string | null;
  version: number;
  parentTemplateId?: string | null;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  _count?: { submissions: number };
}

export interface SubmissionValue {
  id: string;
  fieldId: string;
  value: string;
  field?: FormField;
}

export interface FormSubmission {
  id: string;
  formTemplateId: string;
  createdAt: string;
  values: SubmissionValue[];
  formTemplate?: FormTemplate;
}

export interface BuilderField extends FormField {
  clientId: string;
}
