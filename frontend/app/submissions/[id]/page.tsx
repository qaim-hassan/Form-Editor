"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import type { FormSubmission } from "@/types";
import { submissionsApi, getApiErrorMessage } from "@/lib/api";
import { Card } from "@/components/ui/Card";

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsApi
      .get(id)
      .then(setSubmission)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!submission) {
    return <p className="text-center text-slate-500">Submission not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/forms/${submission.formTemplateId}/submissions`}
        className="text-sm text-brand-600 hover:underline"
      >
        ← Back to submissions
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Submission details</h1>
      <p className="mt-1 text-sm text-slate-500">
        Submitted {new Date(submission.createdAt).toLocaleString()}
        {submission.formTemplate && ` · ${submission.formTemplate.name} (v${submission.formTemplate.version})`}
      </p>

      <Card className="mt-6 space-y-4">
        {submission.values.map((v) => (
          <div key={v.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
            <dt className="text-sm font-medium text-slate-500">
              {v.field?.label ?? v.fieldId}
            </dt>
            <dd className="mt-1 text-slate-900">
              {v.field?.type === "checkbox"
                ? v.value === "true"
                  ? "Yes"
                  : "No"
                : v.value || "—"}
            </dd>
          </div>
        ))}
      </Card>
    </div>
  );
}
