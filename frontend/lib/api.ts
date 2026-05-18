import axios, { type AxiosError } from "axios";
import type { FormSubmission, FormTemplate } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; details?: unknown }>;
    if (axiosError.code === "ERR_NETWORK" || axiosError.message === "Network Error") {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      return `Cannot reach the API at ${base}. Start the backend (cd backend && npm.cmd run dev) and ensure PostgreSQL is running.`;
    }
    if (axiosError.response?.data?.error) {
      const details = axiosError.response.data.details;
      if (Array.isArray(details)) return `${axiosError.response.data.error}: ${details.join(", ")}`;
      return axiosError.response.data.error;
    }
    return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export const formsApi = {
  list: () => api.get<FormTemplate[]>("/api/forms").then((r) => r.data),
  get: (id: string) => api.get<FormTemplate>(`/api/forms/${id}`).then((r) => r.data),
  create: (data: unknown) => api.post<FormTemplate>("/api/forms", data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    api.put<FormTemplate>(`/api/forms/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/api/forms/${id}`).then((r) => r.data),
  submissions: (formId: string) =>
    api.get<FormSubmission[]>(`/api/forms/${formId}/submissions`).then((r) => r.data),
  submit: (formId: string, data: unknown) =>
    api.post<FormSubmission>(`/api/forms/${formId}/submissions`, data).then((r) => r.data),
};

export const submissionsApi = {
  get: (id: string) =>
    api.get<FormSubmission>(`/api/submissions/${id}`).then((r) => r.data),
};

export default api;
