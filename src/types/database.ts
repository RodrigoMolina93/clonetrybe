export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      creator_profiles: {
        Row: {
          created_at: string
          public_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          public_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          public_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      program_applications: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          message: string | null
          program_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["program_application_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          message?: string | null
          program_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["program_application_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          message?: string | null
          program_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["program_application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_applications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "program_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_briefs: {
        Row: {
          created_at: string
          description: string
          donts: string | null
          dos: string | null
          id: string
          program_id: string
          requirements: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          donts?: string | null
          dos?: string | null
          id?: string
          program_id: string
          requirements: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          donts?: string | null
          dos?: string | null
          id?: string
          program_id?: string
          requirements?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_briefs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: true
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_invitations: {
        Row: {
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          invited_by: string
          program_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["program_invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          invited_by: string
          program_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["program_invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          program_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["program_invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_invitations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "program_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_invitations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_memberships: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          joined_at: string
          program_id: string
          source: Database["public"]["Enums"]["program_membership_source"]
          status: Database["public"]["Enums"]["program_membership_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          joined_at?: string
          program_id: string
          source: Database["public"]["Enums"]["program_membership_source"]
          status?: Database["public"]["Enums"]["program_membership_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          joined_at?: string
          program_id?: string
          source?: Database["public"]["Enums"]["program_membership_source"]
          status?: Database["public"]["Enums"]["program_membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_memberships_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "program_memberships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          applications_enabled: boolean
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          cover_image_url: string | null
          created_at: string
          created_by: string
          currency: string
          description: string
          end_date: string | null
          fixed_amount: number | null
          id: string
          name: string
          organization_id: string
          platform_fee_percentage: number
          revenue_share_percentage: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
          visibility: Database["public"]["Enums"]["program_visibility"]
        }
        Insert: {
          applications_enabled?: boolean
          compensation_type: Database["public"]["Enums"]["compensation_type"]
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          currency?: string
          description: string
          end_date?: string | null
          fixed_amount?: number | null
          id?: string
          name: string
          organization_id: string
          platform_fee_percentage?: number
          revenue_share_percentage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["program_visibility"]
        }
        Update: {
          applications_enabled?: boolean
          compensation_type?: Database["public"]["Enums"]["compensation_type"]
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          description?: string
          end_date?: string | null
          fixed_amount?: number | null
          id?: string
          name?: string
          organization_id?: string
          platform_fee_percentage?: number
          revenue_share_percentage?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["program_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "programs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_to_program: {
        Args: { p_message?: string; p_program_id: string }
        Returns: string
      }
      cancel_program_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      complete_brand_onboarding: {
        Args: { brand_name: string; first_name: string; last_name: string }
        Returns: string
      }
      complete_creator_onboarding: {
        Args: { first_name: string; last_name: string; public_name: string }
        Returns: undefined
      }
      get_creator_summaries: {
        Args: { p_creator_ids: string[] }
        Returns: {
          creator_id: string
          first_name: string
          last_name: string
          public_name: string
        }[]
      }
      invite_creator_to_program: {
        Args: { p_creator_id: string; p_program_id: string }
        Returns: string
      }
      respond_to_program_invitation: {
        Args: {
          p_invitation_id: string
          p_response: Database["public"]["Enums"]["program_invitation_status"]
        }
        Returns: string
      }
      review_program_application: {
        Args: {
          p_application_id: string
          p_decision: Database["public"]["Enums"]["program_application_status"]
        }
        Returns: string
      }
      search_creators: {
        Args: { p_limit?: number; p_offset?: number; p_query?: string }
        Returns: {
          creator_id: string
          first_name: string
          last_name: string
          public_name: string
        }[]
      }
      withdraw_program_application: {
        Args: { p_application_id: string }
        Returns: undefined
      }
    }
    Enums: {
      compensation_type: "FIXED" | "REVENUE_SHARE"
      organization_role: "OWNER" | "MEMBER"
      program_application_status:
        | "PENDING"
        | "ACCEPTED"
        | "REJECTED"
        | "WITHDRAWN"
      program_invitation_status:
        | "PENDING"
        | "ACCEPTED"
        | "DECLINED"
        | "CANCELLED"
        | "EXPIRED"
      program_membership_source: "APPLICATION" | "INVITATION" | "MANUAL"
      program_membership_status: "ACTIVE" | "REMOVED"
      program_status: "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED" | "ARCHIVED"
      program_visibility: "PRIVATE" | "PUBLIC"
      user_type: "ADMIN" | "BRAND" | "CREATOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      compensation_type: ["FIXED", "REVENUE_SHARE"],
      organization_role: ["OWNER", "MEMBER"],
      program_application_status: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      program_invitation_status: [
        "PENDING",
        "ACCEPTED",
        "DECLINED",
        "CANCELLED",
        "EXPIRED",
      ],
      program_membership_source: ["APPLICATION", "INVITATION", "MANUAL"],
      program_membership_status: ["ACTIVE", "REMOVED"],
      program_status: ["DRAFT", "ACTIVE", "PAUSED", "ENDED", "ARCHIVED"],
      program_visibility: ["PRIVATE", "PUBLIC"],
      user_type: ["ADMIN", "BRAND", "CREATOR"],
    },
  },
} as const
