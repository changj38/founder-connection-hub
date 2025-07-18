export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      authorized_emails: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      forum_comment_hearts: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comment_hearts_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          heart_count: number
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          heart_count?: number
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          heart_count?: number
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_hearts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_hearts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          heart_count: number
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          heart_count?: number
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          heart_count?: number
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fund_models: {
        Row: {
          avg_entry_valuation_usd: number
          avg_initial_check_usd: number
          carry_pct: number
          created_at: string
          created_by: string
          fund_size_usd: number
          gp_commit_usd: number
          hold_period_years: number
          id: string
          mgmt_fee_pct: number
          name: string
          recycling_rate_pct: number
          reserve_ratio_pct: number
          updated_at: string
        }
        Insert: {
          avg_entry_valuation_usd: number
          avg_initial_check_usd: number
          carry_pct: number
          created_at?: string
          created_by: string
          fund_size_usd: number
          gp_commit_usd: number
          hold_period_years: number
          id?: string
          mgmt_fee_pct: number
          name: string
          recycling_rate_pct: number
          reserve_ratio_pct: number
          updated_at?: string
        }
        Update: {
          avg_entry_valuation_usd?: number
          avg_initial_check_usd?: number
          carry_pct?: number
          created_at?: string
          created_by?: string
          fund_size_usd?: number
          gp_commit_usd?: number
          hold_period_years?: number
          id?: string
          mgmt_fee_pct?: number
          name?: string
          recycling_rate_pct?: number
          reserve_ratio_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      fund_performance_snapshots: {
        Row: {
          created_at: string | null
          deployed_capital: number
          dpi: number
          fund_id: string
          id: string
          irr_percentage: number
          realized_value: number
          remaining_capital: number
          snapshot_date: string
          tvpi: number
          unrealized_value: number
        }
        Insert: {
          created_at?: string | null
          deployed_capital?: number
          dpi?: number
          fund_id: string
          id?: string
          irr_percentage?: number
          realized_value?: number
          remaining_capital?: number
          snapshot_date?: string
          tvpi?: number
          unrealized_value?: number
        }
        Update: {
          created_at?: string | null
          deployed_capital?: number
          dpi?: number
          fund_id?: string
          id?: string
          irr_percentage?: number
          realized_value?: number
          remaining_capital?: number
          snapshot_date?: string
          tvpi?: number
          unrealized_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fund_performance_snapshots_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          check_size: number
          created_at: string
          created_by: string
          deployed_capital: number | null
          deployment_date: string | null
          fund_model_id: string | null
          fund_size: number
          id: string
          name: string
          planned_investments: number
          reserve_ratio: number
          status: string | null
          updated_at: string
        }
        Insert: {
          check_size: number
          created_at?: string
          created_by: string
          deployed_capital?: number | null
          deployment_date?: string | null
          fund_model_id?: string | null
          fund_size: number
          id?: string
          name: string
          planned_investments: number
          reserve_ratio: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          check_size?: number
          created_at?: string
          created_by?: string
          deployed_capital?: number | null
          deployment_date?: string | null
          fund_model_id?: string | null
          fund_size?: number
          id?: string
          name?: string
          planned_investments?: number
          reserve_ratio?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funds_fund_model_id_fkey"
            columns: ["fund_model_id"]
            isOneToOne: false
            referencedRelation: "fund_models"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          message: string
          request_type: string
          requester_email: string | null
          resolution_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message: string
          request_type: string
          requester_email?: string | null
          resolution_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message?: string
          request_type?: string
          requester_email?: string | null
          resolution_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          check_size: number
          company_name: string
          created_at: string
          entry_valuation: number
          fund_id: string
          id: string
          investment_date: string
          marked_up_valuation: number | null
          model_expected_check_size: number | null
          model_expected_valuation: number | null
          ownership_percentage: number
          realized_return: number | null
          updated_at: string
          valuation_type: string | null
          variance_percentage: number | null
        }
        Insert: {
          check_size: number
          company_name: string
          created_at?: string
          entry_valuation: number
          fund_id: string
          id?: string
          investment_date: string
          marked_up_valuation?: number | null
          model_expected_check_size?: number | null
          model_expected_valuation?: number | null
          ownership_percentage: number
          realized_return?: number | null
          updated_at?: string
          valuation_type?: string | null
          variance_percentage?: number | null
        }
        Update: {
          check_size?: number
          company_name?: string
          created_at?: string
          entry_valuation?: number
          fund_id?: string
          id?: string
          investment_date?: string
          marked_up_valuation?: number | null
          model_expected_check_size?: number | null
          model_expected_valuation?: number | null
          ownership_percentage?: number
          realized_return?: number | null
          updated_at?: string
          valuation_type?: string | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      network_contacts: {
        Row: {
          avatar_url: string | null
          category: string
          company: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          is_lp: boolean | null
          linkedin_url: string | null
          name: string
          notes: string | null
          position: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          category: string
          company?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          is_lp?: boolean | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          position?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string
          company?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          is_lp?: boolean | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          position?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      portfolio_companies: {
        Row: {
          ceo_linkedin_url: string | null
          created_at: string
          created_by: string
          description: string | null
          founded_year: number | null
          founder_names: string | null
          id: string
          industry: string | null
          investment_year: number | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          ceo_linkedin_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          founded_year?: number | null
          founder_names?: string | null
          id?: string
          industry?: string | null
          investment_year?: number | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          ceo_linkedin_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          founded_year?: number | null
          founder_names?: string | null
          id?: string
          industry?: string | null
          investment_year?: number | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_simple_irr: {
        Args: {
          investment_amount: number
          current_value: number
          days_held: number
        }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
