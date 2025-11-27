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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      class_skills: {
        Row: {
          class_id: number
          skill_id: number
        }
        Insert: {
          class_id: number
          skill_id: number
        }
        Update: {
          class_id?: number
          skill_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_skills_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_assets: Json | null
          lore: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image_assets?: Json | null
          lore?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image_assets?: Json | null
          lore?: string | null
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          author: string | null
          created_at: string
          description: string | null
          guid: string
          id: number
          image_url: string | null
          link: string | null
          original_desc: string | null
          pub_date: string | null
          title: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          description?: string | null
          guid: string
          id?: number
          image_url?: string | null
          link?: string | null
          original_desc?: string | null
          pub_date?: string | null
          title?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          description?: string | null
          guid?: string
          id?: number
          image_url?: string | null
          link?: string | null
          original_desc?: string | null
          pub_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: number
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      post_tags: {
        Row: {
          post_id: number
          tag_id: number
        }
        Insert: {
          post_id: number
          tag_id: number
        }
        Update: {
          post_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          featured_image_url: string | null
          id: number
          published_at: string | null
          slug: string
          status: string | null
          title: string
          type_id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: number
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          type_id: number
        }
        Update: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: number
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_items: {
        Row: {
          item_id: number
          skill_id: number
        }
        Insert: {
          item_id: number
          skill_id: number
        }
        Update: {
          item_id?: number
          skill_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "skill_relics_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_relics_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          activation_type: string | null
          cooldown: number | null
          created_at: string
          description: string | null
          energy_cost: Json | null
          icon_url: string | null
          id: number
          level_values: Json | null
          max_level: number | null
          name: string | null
          parameters_definition: Json | null
          range: number | null
          reduced_energy_regen: Json | null
          skill_type: string | null
        }
        Insert: {
          activation_type?: string | null
          cooldown?: number | null
          created_at?: string
          description?: string | null
          energy_cost?: Json | null
          icon_url?: string | null
          id?: number
          level_values?: Json | null
          max_level?: number | null
          name?: string | null
          parameters_definition?: Json | null
          range?: number | null
          reduced_energy_regen?: Json | null
          skill_type?: string | null
        }
        Update: {
          activation_type?: string | null
          cooldown?: number | null
          created_at?: string
          description?: string | null
          energy_cost?: Json | null
          icon_url?: string | null
          id?: number
          level_values?: Json | null
          max_level?: number | null
          name?: string | null
          parameters_definition?: Json | null
          range?: number | null
          reduced_energy_regen?: Json | null
          skill_type?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      talent_trees: {
        Row: {
          class_id: number | null
          created_at: string
          id: number
          is_template: boolean
          name: string
          talents_data: Json | null
        }
        Insert: {
          class_id?: number | null
          created_at?: string
          id?: number
          is_template?: boolean
          name: string
          talents_data?: Json | null
        }
        Update: {
          class_id?: number | null
          created_at?: string
          id?: number
          is_template?: boolean
          name?: string
          talents_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_trees_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: number
          knowledge_levels: Json | null
          level_values: Json | null
          max_level: number
          name: string
          parameters_definition: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          knowledge_levels?: Json | null
          level_values?: Json | null
          max_level?: number
          name: string
          parameters_definition?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: number
          knowledge_levels?: Json | null
          level_values?: Json | null
          max_level?: number
          name?: string
          parameters_definition?: Json | null
        }
        Relationships: []
      }
      types: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      weekly_schedules: {
        Row: {
          created_at: string
          day_of_week: Json | null
          event_desc: string | null
          id: number
          name: string | null
          time_slot: string | null
        }
        Insert: {
          created_at?: string
          day_of_week?: Json | null
          event_desc?: string | null
          id?: number
          name?: string | null
          time_slot?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: Json | null
          event_desc?: string | null
          id?: number
          name?: string | null
          time_slot?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_app_role: {
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
