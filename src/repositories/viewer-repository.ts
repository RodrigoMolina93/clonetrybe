import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { UserType } from "@/types/auth";

export type Viewer = { user: User; userType: UserType; firstName: string | null; lastName: string | null };

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("user_type, first_name, last_name").eq("id", user.id).single();
  if (!profile) return null;
  return { user, userType: profile.user_type, firstName: profile.first_name, lastName: profile.last_name };
}

export async function hasCompletedOnboarding(viewer: Viewer): Promise<boolean> {
  if (viewer.userType === "ADMIN") return true;
  const supabase = await createClient();
  const table = viewer.userType === "BRAND" ? "organization_members" : "creator_profiles";
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq("user_id", viewer.user.id);
  return (count ?? 0) > 0;
}
