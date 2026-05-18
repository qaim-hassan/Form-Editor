"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Edit, Eye, FileInput, Trash2 } from "lucide-react";
import type { FormTemplate } from "@/types";
import { formsApi, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    formsApi
      .list()
      .then(setForms)
      .catch((err) => toast.error(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all versions?`)) return;
    try {
      await formsApi.delete(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
      toast.success("Form deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">Manage form templates and submissions</p>
        </div>
        <Link href="/forms/new">
          <Button>Create new form</Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <EmptyState
          title="No forms yet"
          description="Create your first dynamic form template to start collecting submissions."
          action={
            <Link href="/forms/new">
              <Button>Create form</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{form.name}</h2>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    v{form.version}
                  </span>
                </div>
                {form.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{form.description}</p>
                )}
                <p className="mt-3 text-xs text-slate-400">
                  {form.fields.length} fields · {form._count?.submissions ?? 0} submissions
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <Link href={`/forms/${form.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/fill`}>
                  <Button variant="secondary" size="sm">
                    <FileInput className="h-3.5 w-3.5" />
                    Fill
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/submissions`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3.5 w-3.5" />
                    Submissions
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(form.id, form.name)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
