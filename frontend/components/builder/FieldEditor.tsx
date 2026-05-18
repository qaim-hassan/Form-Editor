"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderField, FieldType } from "@/types";
import { fieldTypes } from "@/lib/validation";
import { useBuilderStore } from "@/store/builderStore";
import { SelectOptionsEditor } from "./SelectOptionsEditor";

interface FieldEditorProps {
  field: BuilderField;
}

export function FieldEditor({ field }: FieldEditorProps) {
  const updateField = useBuilderStore((s) => s.updateField);
  const removeField = useBuilderStore((s) => s.removeField);
  const fieldsCount = useBuilderStore((s) => s.fields.length);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.clientId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="cursor-grab text-slate-400 hover:text-slate-600"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => removeField(field.clientId)}
          disabled={fieldsCount <= 1}
          className="text-slate-400 hover:text-red-600 disabled:opacity-30"
          aria-label="Remove field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Label</label>
          <input
            value={field.label}
            onChange={(e) => updateField(field.clientId, { label: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Type</label>
          <select
            value={field.type}
            onChange={(e) => {
              const type = e.target.value as FieldType;
              const patch: Partial<BuilderField> = { type };
              if (type === "select" && !field.options?.length) {
                patch.options = ["Option 1", "Option 2"];
              }
              updateField(field.clientId, patch);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {fieldTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Placeholder</label>
          <input
            value={field.placeholder ?? ""}
            onChange={(e) => updateField(field.clientId, { placeholder: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Help text</label>
          <input
            value={field.helpText ?? ""}
            onChange={(e) => updateField(field.clientId, { helpText: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => updateField(field.clientId, { required: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          Required field
        </label>
      </div>

      {field.type === "select" && (
        <SelectOptionsEditor
          options={field.options ?? []}
          onChange={(options) => updateField(field.clientId, { options })}
        />
      )}
    </div>
  );
}
