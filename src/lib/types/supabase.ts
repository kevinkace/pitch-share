export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          x: number
          y: number
          strike: boolean
          ground: boolean
          out_of_bounds: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          x: number
          y: number
          strike?: boolean
          ground?: boolean
          out_of_bounds?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          x?: number
          y?: number
          strike?: boolean
          ground?: boolean
          out_of_bounds?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          player_name: string
          date: string | null
          sport: string | null
          activity: string | null
          unit: string | null
          pitch_count: number | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title: string
          player_name: string
          date?: string | null
          sport?: string | null
          activity?: string | null
          unit?: string | null
          pitch_count?: number | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          player_name?: string
          date?: string | null
          sport?: string | null
          activity?: string | null
          unit?: string | null
          pitch_count?: number | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}