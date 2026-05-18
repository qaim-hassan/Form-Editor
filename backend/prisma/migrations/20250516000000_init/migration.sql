-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox');

-- CreateTable
CREATE TABLE "FormTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "helpText" TEXT,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmissionValue" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormSubmissionValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormTemplate_parentTemplateId_idx" ON "FormTemplate"("parentTemplateId");

-- CreateIndex
CREATE INDEX "FormTemplate_name_idx" ON "FormTemplate"("name");

-- CreateIndex
CREATE INDEX "FormField_formTemplateId_idx" ON "FormField"("formTemplateId");

-- CreateIndex
CREATE INDEX "FormSubmission_formTemplateId_idx" ON "FormSubmission"("formTemplateId");

-- CreateIndex
CREATE INDEX "FormSubmissionValue_submissionId_idx" ON "FormSubmissionValue"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmissionValue_submissionId_fieldId_key" ON "FormSubmissionValue"("submissionId", "fieldId");

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "FormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmissionValue" ADD CONSTRAINT "FormSubmissionValue_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmissionValue" ADD CONSTRAINT "FormSubmissionValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
