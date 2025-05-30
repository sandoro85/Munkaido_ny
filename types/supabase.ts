export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          address: string
          leader_name: string
          email: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          leader_name: string
          email: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          leader_name?: string
          email?: string
          phone?: string
          created_at?: string
        }
      }
      organization_users: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'admin' | 'user'
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'admin' | 'user'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'admin' | 'user'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      work_events: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          event_type: 'work_start' | 'work_end' | 'official_departure' | 'private_departure' | 'return_from_departure' | 'leave'
          event_date: string
          event_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          event_type: 'work_start' | 'work_end' | 'official_departure' | 'private_departure' | 'return_from_departure' | 'leave'
          event_date: string
          event_time: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          event_type?: 'work_start' | 'work_end' | 'official_departure' | 'private_departure' | 'return_from_departure' | 'leave'
          event_date?: string
          event_time?: string
          created_at?: string
        }
      }
      holidays: {
        Row: {
          id: string
          date: string
          name: string
          is_workday: boolean
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          name: string
          is_workday?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          name?: string
          is_workday?: boolean
          created_at?: string
        }
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
  }
}