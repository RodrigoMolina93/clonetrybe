"use server";

import { revalidatePath } from "next/cache";
import { organizationSettingsSchema, profileSettingsSchema } from "@/features/auth/schemas";
import type { ActionState } from "@/features/auth/types";
import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { requireViewer } from "@/services/auth-service";

const copy = getDictionary().settings;

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireViewer();
  const parsed = profileSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
  }).eq("id", viewer.user.id);
  if (error) return { status: "error", message: copy.error };
  revalidatePath("/app", "layout");
  return { status: "success", message: copy.profileSaved };
}

export async function updateOrganization(_state: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await requireViewer();
  const parsed = organizationSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  if (viewer.organization.role !== "OWNER" || viewer.organization.id !== parsed.data.organizationId) {
    return { status: "error", message: copy.error };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ name: parsed.data.organizationName }).eq("id", viewer.organization.id);
  if (error) return { status: "error", message: copy.error };
  revalidatePath("/app", "layout");
  return { status: "success", message: copy.organizationSaved };
}
