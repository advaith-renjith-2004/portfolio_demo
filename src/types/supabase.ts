export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      card_tags: {
        Row: {
          card_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'card_tags_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'card_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      card_views: {
        Row: {
          card_id: string
          created_at: string | null
          expanded: boolean | null
          id: string
          referrer: string | null
          session_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          expanded?: boolean | null
          id?: string
          referrer?: string | null
          session_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          expanded?: boolean | null
          id?: string
          referrer?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'card_views_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
        ]
      }
      cards: {
        Row: {
          card_type: Database['public']['Enums']['card_type']
          column_id: string
          created_at: string | null
          date_end: string | null
          date_start: string | null
          full_content: string | null
          id: string
          is_pinned: boolean | null
          is_visible: boolean | null
          metadata: Json | null
          position: number | null
          preview_text: string | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          card_type: Database['public']['Enums']['card_type']
          column_id: string
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          full_content?: string | null
          id?: string
          is_pinned?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          position?: number | null
          preview_text?: string | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          card_type?: Database['public']['Enums']['card_type']
          column_id?: string
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          full_content?: string | null
          id?: string
          is_pinned?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          position?: number | null
          preview_text?: string | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cards_column_id_fkey'
            columns: ['column_id']
            isOneToOne: false
            referencedRelation: 'columns'
            referencedColumns: ['id']
          },
        ]
      }
      columns: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      experience_highlights: {
        Row: {
          category: string | null
          display_order: number | null
          highlight_text: string
          id: number
          work_experience_id: number
        }
        Insert: {
          category?: string | null
          display_order?: number | null
          highlight_text: string
          id?: number
          work_experience_id: number
        }
        Update: {
          category?: string | null
          display_order?: number | null
          highlight_text?: string
          id?: number
          work_experience_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_experience_highlights_work_experience'
            columns: ['work_experience_id']
            isOneToOne: false
            referencedRelation: 'work_experience'
            referencedColumns: ['id']
          },
        ]
      }
      links: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          label: string
          link_type: Database['public']['Enums']['link_type'] | null
          position: number | null
          url: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          label: string
          link_type?: Database['public']['Enums']['link_type'] | null
          position?: number | null
          url: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          label?: string
          link_type?: Database['public']['Enums']['link_type'] | null
          position?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'links_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
        ]
      }
      personal_info: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          github_url: string | null
          id: number
          linkedin_url: string | null
          location: string | null
          phone: string | null
          professional_summary: string | null
          profile_image_url: string | null
          resume_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          github_url?: string | null
          id?: number
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_summary?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          github_url?: string | null
          id?: number
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_summary?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          current_title: string | null
          email: string | null
          full_name: string
          id: number
          linkedin_url: string | null
          location: string | null
          phone: string | null
          summary: string | null
        }
        Insert: {
          current_title?: string | null
          email?: string | null
          full_name: string
          id?: number
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          summary?: string | null
        }
        Update: {
          current_title?: string | null
          email?: string | null
          full_name?: string
          id?: number
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      project_highlights: {
        Row: {
          display_order: number | null
          highlight_text: string
          id: number
          project_id: number
        }
        Insert: {
          display_order?: number | null
          highlight_text: string
          id?: number
          project_id: number
        }
        Update: {
          display_order?: number | null
          highlight_text?: string
          id?: number
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_project_highlights_project'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          description: string | null
          end_date: string | null
          id: number
          personal_info_id: number
          project_name: string
          role: string | null
          start_date: string | null
        }
        Insert: {
          description?: string | null
          end_date?: string | null
          id?: number
          personal_info_id: number
          project_name: string
          role?: string | null
          start_date?: string | null
        }
        Update: {
          description?: string | null
          end_date?: string | null
          id?: number
          personal_info_id?: number
          project_name?: string
          role?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_projects_personal_info'
            columns: ['personal_info_id']
            isOneToOne: false
            referencedRelation: 'personal_info'
            referencedColumns: ['id']
          },
        ]
      }
      publications: {
        Row: {
          description: string | null
          id: number
          personal_info_id: number
          publication_date: string | null
          title: string
          url: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          personal_info_id: number
          publication_date?: string | null
          title: string
          url?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          personal_info_id?: number
          publication_date?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'fk_publications_personal_info'
            columns: ['personal_info_id']
            isOneToOne: false
            referencedRelation: 'personal_info'
            referencedColumns: ['id']
          },
        ]
      }
      reactions: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          reaction_type: string
          session_id: string
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          session_id: string
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reactions_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          display_name: string | null
          fingerprint: string | null
          id: string
          last_seen_at: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          fingerprint?: string | null
          id?: string
          last_seen_at?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          fingerprint?: string | null
          id?: string
          last_seen_at?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          category_name: string
          id: number
        }
        Insert: {
          category_name: string
          id?: number
        }
        Update: {
          category_name?: string
          id?: number
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          id: number
          profile_id: number | null
          skill_list: string
        }
        Insert: {
          category: string
          id?: number
          profile_id?: number | null
          skill_list: string
        }
        Update: {
          category?: string
          id?: number
          profile_id?: number | null
          skill_list?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skills_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profile'
            referencedColumns: ['id']
          },
        ]
      }
      soft_skills: {
        Row: {
          id: number
          personal_info_id: number
          skill_name: string
        }
        Insert: {
          id?: number
          personal_info_id: number
          skill_name: string
        }
        Update: {
          id?: number
          personal_info_id?: number
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_soft_skills_personal_info'
            columns: ['personal_info_id']
            isOneToOne: false
            referencedRelation: 'personal_info'
            referencedColumns: ['id']
          },
        ]
      }
      tags: {
        Row: {
          category: Database['public']['Enums']['tag_category'] | null
          color: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: Database['public']['Enums']['tag_category'] | null
          color?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: Database['public']['Enums']['tag_category'] | null
          color?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      technical_skills: {
        Row: {
          id: number
          personal_info_id: number
          skill_category_id: number
          skill_name: string
        }
        Insert: {
          id?: number
          personal_info_id: number
          skill_category_id: number
          skill_name: string
        }
        Update: {
          id?: number
          personal_info_id?: number
          skill_category_id?: number
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_technical_skills_category'
            columns: ['skill_category_id']
            isOneToOne: false
            referencedRelation: 'skill_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fk_technical_skills_personal_info'
            columns: ['personal_info_id']
            isOneToOne: false
            referencedRelation: 'personal_info'
            referencedColumns: ['id']
          },
        ]
      }
      work_experience: {
        Row: {
          company_name: string
          created_at: string | null
          end_year: number | null
          id: number
          is_current: boolean | null
          job_title: string
          personal_info_id: number
          start_year: number
        }
        Insert: {
          company_name: string
          created_at?: string | null
          end_year?: number | null
          id?: number
          is_current?: boolean | null
          job_title: string
          personal_info_id: number
          start_year: number
        }
        Update: {
          company_name?: string
          created_at?: string | null
          end_year?: number | null
          id?: number
          is_current?: boolean | null
          job_title?: string
          personal_info_id?: number
          start_year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'fk_work_experience_personal_info'
            columns: ['personal_info_id']
            isOneToOne: false
            referencedRelation: 'personal_info'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_session_react: {
        Args: { p_card_id: string; p_session_id: string }
        Returns: boolean
      }
      get_card_reaction_counts: {
        Args: { p_card_id: string }
        Returns: {
          count: number
          reaction_type: string
        }[]
      }
      get_card_view_count: { Args: { p_card_id: string }; Returns: number }
      is_authenticated: { Args: never; Returns: boolean }
      is_card_visible: { Args: { p_card_id: string }; Returns: boolean }
      is_column_visible: { Args: { p_column_id: string }; Returns: boolean }
      is_valid_session: { Args: { p_session_id: string }; Returns: boolean }
    }
    Enums: {
      card_type: 'experience' | 'project' | 'skill' | 'education' | 'about'
      link_type: 'github' | 'demo' | 'article' | 'external'
      tag_category: 'language' | 'framework' | 'database' | 'tool' | 'platform' | 'concept'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_type: ['experience', 'project', 'skill', 'education', 'about'],
      link_type: ['github', 'demo', 'article', 'external'],
      tag_category: ['language', 'framework', 'database', 'tool', 'platform', 'concept'],
    },
  },
} as const
