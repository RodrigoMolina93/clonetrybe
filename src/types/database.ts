export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      organization_members: {
        Row: { organization_id: string; user_id: string; role: Database["public"]["Enums"]["organization_role"]; created_at: string };
        Insert: { organization_id: string; user_id: string; role?: Database["public"]["Enums"]["organization_role"]; created_at?: string };
        Update: { organization_id?: string; user_id?: string; role?: Database["public"]["Enums"]["organization_role"]; created_at?: string };
        Relationships: [
          { foreignKeyName: "organization_members_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "organization_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      organizations: {
        Row: { id: string; name: string; slug: string; logo_url: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; logo_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; slug?: string; logo_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_organization_onboarding: {
        Args: { organization_name: string; first_name: string; last_name: string };
        Returns: string;
      };
    };
    Enums: { organization_role: "OWNER" | "MEMBER" };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<TableName extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][TableName]["Row"];
export type Enums<EnumName extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][EnumName];
