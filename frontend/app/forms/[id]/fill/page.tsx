"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import type { FormTemplate } from "@/types";
import { formsApi, getApiErrorMessage } from "@/lib/api";
import { buildSubmissionSchema } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DynamicFormFields } from "@/components/forms/DynamicFormFields";

export default function FillFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () => (template ? buildSubmissionSchema(template.fields) : null),
    [template]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: schema ? zodResolver(schema) : undefined,
  });

  useEffect(() => {
    formsApi
      .get(formId)
      .then(setTemplate)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [formId]);

  async function onSubmit(data: Record<string, string>) {
    if (!template) return;
    setSubmitting(true);
    try {
      const values = template.fields.map((field) => {
        let value = data[field.id!] ?? "";
        if (field.type === "checkbox") {
          value =
            value === true || value === "true" || value === "on" ? "true" : "false";
        }
        return { fieldId: field.id!, value: String(value) };
      });

      const submission = await formsApi.submit(formId, { values });
      toast.success("Submission saved");
      router.push(`/submissions/${submission.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!template) {
    return <p className="text-center text-slate-500">Form not found.</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">{template.name}</h1>
      {template.description && (
        <p className="mb-6 text-slate-500">{template.description}</p>
      )}
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DynamicFormFields
            fields={template.fields}
            register={register}
            errors={errors}
          />
          <Button type="submit" loading={submitting} className="w-full">
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
}
