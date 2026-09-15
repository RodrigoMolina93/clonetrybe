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
      creator_shipping_addresses: {
        Row: {
          additional_info: string | null
          apartment: string | null
          city: string
          country: string
          created_at: string
          creator_id: string
          phone: string | null
          postal_code: string
          province: string
          recipient_name: string
          street: string
          street_number: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          apartment?: string | null
          city: string
          country?: string
          created_at?: string
          creator_id: string
          phone?: string | null
          postal_code: string
          province: string
          recipient_name: string
          street: string
          street_number: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          apartment?: string | null
          city?: string
          country?: string
          created_at?: string
          creator_id?: string
          phone?: string | null
          postal_code?: string
          province?: string
          recipient_name?: string
          street?: string
          street_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_shipping_addresses_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
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
      sample_issues: {
        Row: {
          brand_note: string | null
          created_at: string
          creator_id: string
          description: string
          id: string
          issue_type: Database["public"]["Enums"]["sample_issue_type"]
          resolved_at: string | null
          sample_request_id: string
          status: Database["public"]["Enums"]["sample_issue_status"]
        }
        Insert: {
          brand_note?: string | null
          created_at?: string
          creator_id: string
          description: string
          id?: string
          issue_type: Database["public"]["Enums"]["sample_issue_type"]
          resolved_at?: string | null
          sample_request_id: string
          status?: Database["public"]["Enums"]["sample_issue_status"]
        }
        Update: {
          brand_note?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          issue_type?: Database["public"]["Enums"]["sample_issue_type"]
          resolved_at?: string | null
          sample_request_id?: string
          status?: Database["public"]["Enums"]["sample_issue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sample_issues_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sample_issues_request_creator_fkey"
            columns: ["sample_request_id", "creator_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id", "creator_id"]
          },
        ]
      }
      sample_product_variants: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          product_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          product_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "sample_products"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_products: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          organization_id: string
          program_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          organization_id: string
          program_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_products_program_organization_fkey"
            columns: ["program_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      sample_requests: {
        Row: {
          approved_at: string | null
          brand_note: string | null
          cancelled_at: string | null
          carrier_name: string | null
          created_at: string
          creator_id: string
          creator_note: string | null
          id: string
          preparing_at: string | null
          product_id: string
          program_id: string
          received_at: string | null
          rejected_at: string | null
          requested_at: string
          shipped_at: string | null
          shipping_address_snapshot: Json
          status: Database["public"]["Enums"]["sample_request_status"]
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          approved_at?: string | null
          brand_note?: string | null
          cancelled_at?: string | null
          carrier_name?: string | null
          created_at?: string
          creator_id: string
          creator_note?: string | null
          id?: string
          preparing_at?: string | null
          product_id: string
          program_id: string
          received_at?: string | null
          rejected_at?: string | null
          requested_at?: string
          shipped_at?: string | null
          shipping_address_snapshot: Json
          status?: Database["public"]["Enums"]["sample_request_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          approved_at?: string | null
          brand_note?: string | null
          cancelled_at?: string | null
          carrier_name?: string | null
          created_at?: string
          creator_id?: string
          creator_note?: string | null
          id?: string
          preparing_at?: string | null
          product_id?: string
          program_id?: string
          received_at?: string | null
          rejected_at?: string | null
          requested_at?: string
          shipped_at?: string | null
          shipping_address_snapshot?: Json
          status?: Database["public"]["Enums"]["sample_request_status"]
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_requests_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sample_requests_product_program_fkey"
            columns: ["product_id", "program_id"]
            isOneToOne: false
            referencedRelation: "sample_products"
            referencedColumns: ["id", "program_id"]
          },
          {
            foreignKeyName: "sample_requests_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_requests_variant_product_fkey"
            columns: ["variant_id", "product_id"]
            isOneToOne: false
            referencedRelation: "sample_product_variants"
            referencedColumns: ["id", "product_id"]
          },
        ]
      }
      sample_tracking_events: {
        Row: {
          actor_user_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["sample_tracking_event_type"]
          id: string
          metadata: Json | null
          sample_request_id: string
        }
        Insert: {
          actor_user_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["sample_tracking_event_type"]
          id?: string
          metadata?: Json | null
          sample_request_id: string
        }
        Update: {
          actor_user_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["sample_tracking_event_type"]
          id?: string
          metadata?: Json | null
          sample_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_tracking_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sample_tracking_events_sample_request_id_fkey"
            columns: ["sample_request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
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
      confirm_sample_received: {
        Args: { p_request_id: string }
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
      get_sample_request_shipping_address: {
        Args: { p_request_id: string }
        Returns: {
          additional_info: string
          apartment: string
          city: string
          country: string
          phone: string
          postal_code: string
          province: string
          recipient_name: string
          street: string
          street_number: string
        }[]
      }
      invite_creator_to_program: {
        Args: { p_creator_id: string; p_program_id: string }
        Returns: string
      }
      report_sample_issue: {
        Args: {
          p_description: string
          p_issue_type: Database["public"]["Enums"]["sample_issue_type"]
          p_request_id: string
        }
        Returns: string
      }
      request_sample: {
        Args: {
          p_creator_note?: string
          p_product_id: string
          p_variant_id?: string
        }
        Returns: string
      }
      resolve_sample_issue: {
        Args: {
          p_brand_note?: string
          p_carrier_name?: string
          p_issue_id: string
          p_resolution_status: Database["public"]["Enums"]["sample_request_status"]
          p_tracking_number?: string
          p_tracking_url?: string
        }
        Returns: undefined
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
      transition_sample_request: {
        Args: {
          p_brand_note?: string
          p_carrier_name?: string
          p_request_id: string
          p_target_status: Database["public"]["Enums"]["sample_request_status"]
          p_tracking_number?: string
          p_tracking_url?: string
        }
        Returns: undefined
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
      sample_issue_status: "OPEN" | "RESOLVED"
      sample_issue_type:
        | "NOT_RECEIVED"
        | "WRONG_PRODUCT"
        | "WRONG_VARIANT"
        | "DAMAGED"
        | "OTHER"
      sample_request_status:
        | "REQUESTED"
        | "APPROVED"
        | "REJECTED"
        | "PREPARING"
        | "SHIPPED"
        | "RECEIVED"
        | "ISSUE"
        | "CANCELLED"
      sample_tracking_event_type:
        | "REQUEST_CREATED"
        | "REQUEST_APPROVED"
        | "REQUEST_REJECTED"
        | "PREPARING_STARTED"
        | "SHIPPED"
        | "RECEIVED_CONFIRMED"
        | "ISSUE_REPORTED"
        | "ISSUE_RESOLVED"
        | "REQUEST_CANCELLED"
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
      sample_issue_status: ["OPEN", "RESOLVED"],
      sample_issue_type: [
        "NOT_RECEIVED",
        "WRONG_PRODUCT",
        "WRONG_VARIANT",
        "DAMAGED",
        "OTHER",
      ],
      sample_request_status: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PREPARING",
        "SHIPPED",
        "RECEIVED",
        "ISSUE",
        "CANCELLED",
      ],
      sample_tracking_event_type: [
        "REQUEST_CREATED",
        "REQUEST_APPROVED",
        "REQUEST_REJECTED",
        "PREPARING_STARTED",
        "SHIPPED",
        "RECEIVED_CONFIRMED",
        "ISSUE_REPORTED",
        "ISSUE_RESOLVED",
        "REQUEST_CANCELLED",
      ],
      user_type: ["ADMIN", "BRAND", "CREATOR"],
    },
  },
} as const
