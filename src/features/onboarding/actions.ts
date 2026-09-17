"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@/features/auth/schemas";
import type { ActionState } from "@/features/auth/types";
import { getDictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarding } from "@/services/auth-service";

const errorMessage = getDictionary().onboarding.error;

export async function completeOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireOnboarding();
  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_organization_onboarding", {
    organization_name: parsed.data.organizationName,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
  });
  if (error) return { status: "error", message: errorMessage };
  redirect("/app");
}
