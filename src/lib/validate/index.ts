import type { ZodSchema } from "zod";
import { fromError } from "zod-validation-error";

export function validateInput(
  element: string | HTMLInputElement,
  schema: ZodSchema,
) {
  if (typeof element === "string")
    element = document.getElementById(element) as HTMLInputElement;
  const updateInputValidity = () => updateValidity(element, schema);
  element.addEventListener("input", updateInputValidity);
}

export function updateValidity(element: HTMLInputElement, schema: ZodSchema) {
  const { success, data, error } = schema.safeParse(element.value);
  const message = error && fromError(error, { prefix: null }).toString();

  if (success) element.value = data;
  element.setCustomValidity(message ?? "");
  element.dispatchEvent(
    new CustomEvent("validated", { detail: { valid: success, message } }),
  );
}
