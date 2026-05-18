"use client";

import type { FormField } from "@/types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface DynamicFormFieldsProps {
  fields: FormField[];
  register: UseFormRegister<Record<string, string>>;
  errors: FieldErrors<Record<string, string>>;
}

export function DynamicFormFields({ fields, register, errors }: DynamicFormFieldsProps) {
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const error = errors[field.id!]?.message as string | undefined;
        const common = {
          id: field.id,
          ...register(field.id!),
        };

        return (
          <div key={field.id} className="space-y-1">
            <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>

            {field.type === "textarea" && (
              <textarea
                {...common}
                rows={4}
                placeholder={field.placeholder ?? undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            )}

            {field.type === "select" && (
              <select
                {...common}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select an option</option>
                {(field.options as string[] | undefined)?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "checkbox" && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  value="true"
                  {...register(field.id!, {
                    setValueAs: (v) =>
                      v === true || v === "true" || v === "on" ? "true" : "false",
                  })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {field.placeholder || "Yes"}
              </label>
            )}

            {!["textarea", "select", "checkbox"].includes(field.type) && (
              <input
                {...common}
                type={field.type === "number" ? "number" : field.type}
                placeholder={field.placeholder ?? undefined}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            )}

            {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}
