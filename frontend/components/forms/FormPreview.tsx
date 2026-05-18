"use client";

import type { BuilderField } from "@/types";

interface FormPreviewProps {
  name: string;
  description: string;
  fields: BuilderField[];
}

export function FormPreview({ name, description, fields }: FormPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-semibold text-slate-900">{name || "Untitled Form"}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-6 space-y-4">
        {fields.map((field) => (
          <div key={field.clientId} className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                disabled
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={3}
              />
            ) : field.type === "select" ? (
              <select disabled className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                {(field.options ?? []).filter(Boolean).length > 0 ? (
                  (field.options ?? []).filter(Boolean).map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))
                ) : (
                  <option>Select...</option>
                )}
              </select>
            ) : field.type === "checkbox" ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" disabled className="h-4 w-4" />
                {field.placeholder || "Checkbox"}
              </label>
            ) : (
              <input
                disabled
                type={field.type === "number" ? "number" : field.type}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            )}
            {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
