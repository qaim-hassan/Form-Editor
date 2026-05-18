"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";
import { builderFormSchema } from "@/lib/validation";
import { formsApi, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FieldEditor } from "./FieldEditor";
import { FormPreview } from "@/components/forms/FormPreview";

interface FormBuilderProps {
  formId?: string;
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const name = useBuilderStore((s) => s.name);
  const description = useBuilderStore((s) => s.description);
  const fields = useBuilderStore((s) => s.fields);
  const setName = useBuilderStore((s) => s.setName);
  const setDescription = useBuilderStore((s) => s.setDescription);
  const addField = useBuilderStore((s) => s.addField);
  const reorderFields = useBuilderStore((s) => s.reorderFields);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.clientId === active.id);
    const newIndex = fields.findIndex((f) => f.clientId === over.id);
    const reordered = [...fields];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);
    reorderFields(reordered);
  }

  async function handleSave() {
    const payload = {
      name,
      description: description || undefined,
      fields: fields.map((f, i) => ({
        label: f.label,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder || undefined,
        helpText: f.helpText || undefined,
        options:
          f.type === "select"
            ? f.options?.map((o) => o.trim()).filter(Boolean)
            : undefined,
        order: i,
      })),
    };

    const parsed = builderFormSchema.safeParse({
      name,
      description,
      fields,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid form");
      return;
    }

    setSaving(true);
    try {
      if (formId) {
        const updated = await formsApi.update(formId, payload);
        toast.success(
          updated.version > 1 && updated.id !== formId
            ? `Saved as version ${updated.version}`
            : "Form updated"
        );
        router.push(`/forms/${updated.id}/edit`);
      } else {
        const created = await formsApi.create(payload);
        toast.success("Form created");
        router.push(`/forms/${created.id}/edit`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Form details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Contact form"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Optional description"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fields</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addField}>
              <Plus className="h-4 w-4" />
              Add field
            </Button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.clientId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.map((field) => (
                  <FieldEditor key={field.clientId} field={field} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
          {formId ? "Save template" : "Create template"}
        </Button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Live preview</h2>
        <FormPreview name={name} description={description} fields={fields} />
      </div>
    </div>
  );
}
