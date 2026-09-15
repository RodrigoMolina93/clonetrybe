"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n";
import { loginSchema, registerSchema } from "@/features/auth/schemas";
import { getOnboardingRoute } from "@/features/auth/routing";
import { getViewer } from "@/repositories/viewer-repository";
import { redirectViewerHome } from "@/services/auth-service";
import type { ActionState } from "@/features/auth/types";

const messages = getDictionary().auth.errors;

function authErrorMessage(code?: string) {
  if (code === "invalid_credentials") return messages.invalidCredentials;
  if (code === "email_not_confirmed") return messages.emailNotConfirmed;
  if (code === "user_already_exists" || code === "email_exists") return messages.emailAlreadyRegistered;
  if (code?.includes("rate_limit")) return messages.rateLimit;
  return messages.generic;
}

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: authErrorMessage(error.code) };
  const viewer = await getViewer();
  if (!viewer) return { status: "error", message: messages.generic };
  return redirectViewerHome(viewer);
}

export async function register(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return { status: "error", message: messages.generic };
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { user_type: parsed.data.userType }, emailRedirectTo: `${appUrl}/auth/confirm` },
  });
  if (error) return { status: "error", message: authErrorMessage(error.code) };
  redirect(data.session ? getOnboardingRoute(parsed.data.userType) : "/confirmacion");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/ingresar");
}
