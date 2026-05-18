import type { FieldType, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/errors.js";
import { sanitizeOptional, sanitizeString } from "../utils/sanitize.js";
import type { CreateFormInput, UpdateFormInput } from "../utils/validation.js";

const formInclude = {
  fields: { orderBy: { order: "asc" as const } },
  _count: { select: { submissions: true } },
} satisfies Prisma.FormTemplateInclude;

export function getRootId(template: { id: string; parentTemplateId: string | null }) {
  return template.parentTemplateId ?? template.id;
}

export async function getTemplateFamilyIds(rootId: string) {
  const family = await prisma.formTemplate.findMany({
    where: {
      OR: [{ id: rootId }, { parentTemplateId: rootId }],
    },
    select: { id: true },
  });
  return family.map((t) => t.id);
}

export async function getLatestVersion(rootId: string) {
  return prisma.formTemplate.findFirst({
    where: {
      OR: [{ id: rootId }, { parentTemplateId: rootId }],
    },
    orderBy: { version: "desc" },
    include: formInclude,
  });
}

function mapFields(fields: CreateFormInput["fields"]) {
  return fields.map((field, index) => ({
    label: sanitizeString(field.label),
    type: field.type as FieldType,
    required: field.required,
    placeholder: sanitizeOptional(field.placeholder ?? undefined),
    helpText: sanitizeOptional(field.helpText ?? undefined),
    options:
      field.type === "select" && field.options?.length
        ? field.options.map((o) => sanitizeString(o))
        : undefined,
    order: field.order ?? index,
  }));
}

export async function listLatestForms() {
  const templates = await prisma.formTemplate.findMany({
    include: {
      ...formInclude,
      parent: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const latestByRoot = new Map<string, (typeof templates)[0]>();

  for (const template of templates) {
    const rootId = getRootId(template);
    const existing = latestByRoot.get(rootId);
    if (!existing || template.version > existing.version) {
      latestByRoot.set(rootId, template);
    }
  }

  const latest = Array.from(latestByRoot.values());

  const enriched = await Promise.all(
    latest.map(async (template) => {
      const rootId = getRootId(template);
      const familyIds = await getTemplateFamilyIds(rootId);
      const submissionCount = await prisma.formSubmission.count({
        where: { formTemplateId: { in: familyIds } },
      });
      return {
        ...template,
        _count: { submissions: submissionCount },
      };
    })
  );

  return enriched.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getFormById(id: string) {
  const form = await prisma.formTemplate.findUnique({
    where: { id },
    include: formInclude,
  });
  if (!form) throw new AppError(404, "Form template not found");
  return form;
}

export async function createForm(input: CreateFormInput) {
  return prisma.formTemplate.create({
    data: {
      name: sanitizeString(input.name),
      description: sanitizeOptional(input.description ?? undefined),
      version: 1,
      fields: { create: mapFields(input.fields) },
    },
    include: formInclude,
  });
}

export async function updateForm(id: string, input: UpdateFormInput) {
  const existing = await getFormById(id);
  const rootId = getRootId(existing);
  const familyIds = await getTemplateFamilyIds(rootId);
  const submissionCount = await prisma.formSubmission.count({
    where: { formTemplateId: { in: familyIds } },
  });

  const data = {
    name: sanitizeString(input.name),
    description: sanitizeOptional(input.description ?? undefined),
    fields: mapFields(input.fields),
  };

  if (submissionCount === 0) {
    return prisma.$transaction(async (tx) => {
      await tx.formField.deleteMany({ where: { formTemplateId: id } });
      return tx.formTemplate.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          fields: { create: data.fields },
        },
        include: formInclude,
      });
    });
  }

  const latest = await getLatestVersion(rootId);
  const nextVersion = (latest?.version ?? existing.version) + 1;

  return prisma.formTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      version: nextVersion,
      parentTemplateId: rootId,
      fields: { create: data.fields },
    },
    include: formInclude,
  });
}

export async function deleteForm(id: string) {
  const form = await getFormById(id);
  const rootId = getRootId(form);
  const familyIds = await getTemplateFamilyIds(rootId);

  await prisma.formTemplate.deleteMany({
    where: { id: { in: familyIds } },
  });

  return { deleted: familyIds.length };
}

export async function resolveSubmissionTemplateId(formId: string) {
  const form = await getFormById(formId);
  const rootId = getRootId(form);
  const latest = await getLatestVersion(rootId);
  return latest?.id ?? form.id;
}
