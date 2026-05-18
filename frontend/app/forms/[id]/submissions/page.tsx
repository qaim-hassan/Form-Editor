"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import type { FormSubmission, FormTemplate } from "@/types";
import { formsApi, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([formsApi.get(formId), formsApi.submissions(formId)])
      .then(([form, subs]) => {
        setTemplate(form);
        setSubmissions(subs);
      })
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Submissions: {template?.name}
        </h1>
        <p className="mt-1 text-slate-500">
          Version {template?.version} · {submissions.length} total
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Share the fill link to start collecting responses."
          action={
            <Link href={`/forms/${formId}/fill`}>
              <Button>Fill form</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card key={sub.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-slate-900">
                  Submission {sub.id.slice(0, 8)}…
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(sub.createdAt).toLocaleString()} · {sub.values.length} fields
                </p>
              </div>
              <Link href={`/submissions/${sub.id}`}>
                <Button variant="secondary" size="sm">
                  View
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
