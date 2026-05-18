"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { useBuilderStore } from "@/store/builderStore";
import { formsApi, getApiErrorMessage } from "@/lib/api";

export default function EditFormPage() {
  const params = useParams();
  const formId = params.id as string;
  const loadFromTemplate = useBuilderStore((s) => s.loadFromTemplate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formsApi
      .get(formId)
      .then((form) => {
        loadFromTemplate({
          name: form.name,
          description: form.description,
          fields: form.fields.map((f) => ({
            ...f,
            id: f.id,
            options: (f.options as string[] | null) ?? undefined,
          })),
        });
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [formId, loadFromTemplate]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Edit form template</h1>
      <FormBuilder formId={formId} />
    </div>
  );
}
