import { create } from "zustand";
import type { BuilderField } from "@/types";

function newField(order: number): BuilderField {
  return {
    clientId: crypto.randomUUID(),
    label: "New Field",
    type: "text",
    required: false,
    placeholder: "",
    helpText: "",
    order,
  };
}

interface BuilderState {
  name: string;
  description: string;
  fields: BuilderField[];
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setFields: (fields: BuilderField[]) => void;
  addField: () => void;
  removeField: (clientId: string) => void;
  updateField: (clientId: string, patch: Partial<BuilderField>) => void;
  reorderFields: (fields: BuilderField[]) => void;
  reset: () => void;
  loadFromTemplate: (data: {
    name: string;
    description?: string | null;
    fields: Omit<BuilderField, "clientId">[];
  }) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  name: "",
  description: "",
  fields: [newField(0)],

  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),

  setFields: (fields) => set({ fields }),

  addField: () =>
    set((state) => ({
      fields: [...state.fields, newField(state.fields.length)],
    })),

  removeField: (clientId) =>
    set((state) => ({
      fields: state.fields
        .filter((f) => f.clientId !== clientId)
        .map((f, i) => ({ ...f, order: i })),
    })),

  updateField: (clientId, patch) =>
    set((state) => ({
      fields: state.fields.map((f) =>
        f.clientId === clientId ? { ...f, ...patch } : f
      ),
    })),

  reorderFields: (fields) =>
    set({
      fields: fields.map((f, i) => ({ ...f, order: i })),
    }),

  reset: () =>
    set({
      name: "",
      description: "",
      fields: [newField(0)],
    }),

  loadFromTemplate: ({ name, description, fields }) =>
    set({
      name,
      description: description ?? "",
      fields: fields.map((f, i) => ({
        ...f,
        clientId: f.id ?? crypto.randomUUID(),
        order: f.order ?? i,
        placeholder: f.placeholder ?? "",
        helpText: f.helpText ?? "",
        options: f.options ?? (f.type === "select" ? ["Option 1"] : undefined),
      })),
    }),
}));
