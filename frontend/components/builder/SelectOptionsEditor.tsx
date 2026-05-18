"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SelectOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function SelectOptionsEditor({ options, onChange }: SelectOptionsEditorProps) {
  const list = options.length > 0 ? options : [""];

  function updateAt(index: number, value: string) {
    const next = [...list];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index: number) {
    if (list.length <= 1) {
      onChange([]);
      return;
    }
    onChange(list.filter((_, i) => i !== index));
  }

  function addOption() {
    onChange([...list, ""]);
  }

  return (
    <div className="mt-3 space-y-2">
      <label className="text-xs font-medium text-slate-600">Options</label>
      {list.map((option, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={option}
            onChange={(e) => updateAt(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => removeAt(index)}
            className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove option"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addOption}>
        <Plus className="h-3.5 w-3.5" />
        Add option
      </Button>
    </div>
  );
}
