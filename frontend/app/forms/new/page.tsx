"use client";

import { useEffect } from "react";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { useBuilderStore } from "@/store/builderStore";

export default function NewFormPage() {
  const reset = useBuilderStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Create form template</h1>
      <FormBuilder />
    </div>
  );
}
