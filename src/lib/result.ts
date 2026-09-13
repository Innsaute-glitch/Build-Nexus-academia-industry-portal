export type ActionState = { status: "idle" | "success" | "error"; message: string; fieldErrors?: Record<string, string[]> };
export const initialActionState: ActionState = { status: "idle", message: "" };

export function formDataObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
