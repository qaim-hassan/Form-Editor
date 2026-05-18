import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { DynamicFormFields } from "./DynamicFormFields";

function Wrapper() {
  const { register, formState: { errors } } = useForm();
  return (
    <DynamicFormFields
      fields={[
        {
          id: "f1",
          label: "Name",
          type: "text",
          required: true,
          order: 0,
        },
      ]}
      register={register}
      errors={errors}
    />
  );
}

describe("DynamicFormFields", () => {
  it("renders field label", () => {
    render(<Wrapper />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});
