import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationRole } from "@/types/auth";

export type ViewerOrganization = { id: string; name: string; slug: string; logoUrl: string | null; role: OrganizationRole };
export type Viewer = { user: User; firstName: string | null; lastName: string | null; organization: ViewerOrganization | null };

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single(),
    supabase.from("organization_members").select("organization_id, role").eq("user_id", user.id).order("created_at").limit(1).maybeSingle(),
  ]);
  if (!profile) return null;

  let organization: ViewerOrganization | null = null;
  if (membership) {
    const { data } = await supabase.from("organizations").select("id, name, slug, logo_url").eq("id", membership.organization_id).single();
    if (data) organization = { id: data.id, name: data.name, slug: data.slug, logoUrl: data.logo_url, role: membership.role };
  }

  return { user, firstName: profile.first_name, lastName: profile.last_name, organization };
});
