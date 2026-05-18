import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

export function sanitizeString(value: string): string {
  return sanitizeHtml(value.trim(), SANITIZE_OPTIONS);
}

export function sanitizeOptional(value: string | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  return sanitizeString(value);
}
