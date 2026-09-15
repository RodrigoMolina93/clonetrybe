export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type UserType = "ADMIN" | "BRAND" | "CREATOR";
export type OrganizationRole = "OWNER" | "MEMBER";

type ProfileRow = { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; user_type: UserType; created_at: string; updated_at: string };
type OrganizationRow = { id: string; name: string; slug: string; logo_url: string | null; created_at: string; updated_at: string };
type OrganizationMemberRow = { organization_id: string; user_id: string; role: OrganizationRole; created_at: string };
type CreatorProfileRow = { user_id: string; public_name: string; created_at: string; updated_at: string };

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<Omit<ProfileRow, "id">> & Pick<ProfileRow, "id" | "user_type">; Update: Partial<Omit<ProfileRow, "id" | "created_at">>; Relationships: [] };
      organizations: { Row: OrganizationRow; Insert: Partial<Omit<OrganizationRow, "name" | "slug">> & Pick<OrganizationRow, "name" | "slug">; Update: Partial<Omit<OrganizationRow, "id" | "created_at">>; Relationships: [] };
      organization_members: { Row: OrganizationMemberRow; Insert: OrganizationMemberRow; Update: Partial<Pick<OrganizationMemberRow, "role">>; Relationships: [] };
      creator_profiles: { Row: CreatorProfileRow; Insert: Pick<CreatorProfileRow, "user_id" | "public_name"> & Partial<Pick<CreatorProfileRow, "created_at" | "updated_at">>; Update: Partial<Pick<CreatorProfileRow, "public_name" | "updated_at">>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      complete_brand_onboarding: { Args: { brand_name: string; first_name: string; last_name: string }; Returns: string };
      complete_creator_onboarding: { Args: { first_name: string; last_name: string; public_name: string }; Returns: undefined };
    };
    Enums: { user_type: UserType; organization_role: OrganizationRole };
    CompositeTypes: Record<string, never>;
  };
}
