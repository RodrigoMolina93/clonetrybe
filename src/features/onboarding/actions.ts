"use server";

import { redirect } from "next/navigation";
import { brandOnboardingSchema, creatorOnboardingSchema } from "@/features/auth/schemas";
import type { ActionState } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n";
import { requireOnboardingRole } from "@/services/auth-service";

const errorMessage = getDictionary().onboarding.error;

export async function completeBrandOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireOnboardingRole("BRAND");
  const parsed = brandOnboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_brand_onboarding", {
    brand_name: parsed.data.brandName,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
  });
  if (error) return { status: "error", message: errorMessage };
  redirect("/marca");
}

export async function completeCreatorOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireOnboardingRole("CREATOR");
  const parsed = creatorOnboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_creator_onboarding", {
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    public_name: parsed.data.publicName,
  });
  if (error) return { status: "error", message: errorMessage };
  redirect("/creator");
}
