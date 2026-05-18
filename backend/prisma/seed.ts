import { PrismaClient, FieldType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.formSubmissionValue.deleteMany();
  await prisma.formSubmission.deleteMany();
  await prisma.formField.deleteMany();
  await prisma.formTemplate.deleteMany();

  const contactForm = await prisma.formTemplate.create({
    data: {
      name: "Contact Us",
      description: "A simple contact form for customer inquiries.",
      version: 1,
      fields: {
        create: [
          {
            label: "Full Name",
            type: FieldType.text,
            required: true,
            placeholder: "Jane Doe",
            order: 0,
          },
          {
            label: "Email Address",
            type: FieldType.email,
            required: true,
            placeholder: "jane@example.com",
            helpText: "We will never share your email.",
            order: 1,
          },
          {
            label: "Subject",
            type: FieldType.select,
            required: true,
            options: ["General", "Support", "Sales"],
            order: 2,
          },
          {
            label: "Message",
            type: FieldType.textarea,
            required: true,
            placeholder: "How can we help?",
            order: 3,
          },
          {
            label: "Subscribe to newsletter",
            type: FieldType.checkbox,
            required: false,
            order: 4,
          },
        ],
      },
    },
    include: { fields: true },
  });

  const feedbackForm = await prisma.formTemplate.create({
    data: {
      name: "Product Feedback",
      description: "Collect product feedback from users.",
      version: 1,
      fields: {
        create: [
          {
            label: "Rating",
            type: FieldType.number,
            required: true,
            helpText: "Rate from 1 to 10",
            order: 0,
          },
          {
            label: "Review Date",
            type: FieldType.date,
            required: false,
            order: 1,
          },
          {
            label: "Comments",
            type: FieldType.textarea,
            required: false,
            order: 2,
          },
        ],
      },
    },
    include: { fields: true },
  });

  const nameField = contactForm.fields.find((f) => f.label === "Full Name")!;
  const emailField = contactForm.fields.find((f) => f.label === "Email Address")!;
  const subjectField = contactForm.fields.find((f) => f.label === "Subject")!;
  const messageField = contactForm.fields.find((f) => f.label === "Message")!;

  await prisma.formSubmission.create({
    data: {
      formTemplateId: contactForm.id,
      values: {
        create: [
          { fieldId: nameField.id, value: "Alice Johnson" },
          { fieldId: emailField.id, value: "alice@example.com" },
          { fieldId: subjectField.id, value: "Support" },
          { fieldId: messageField.id, value: "I need help with my account." },
        ],
      },
    },
  });

  console.log("Seed complete:", {
    contactFormId: contactForm.id,
    feedbackFormId: feedbackForm.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
