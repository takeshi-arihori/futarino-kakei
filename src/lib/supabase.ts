import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（Service Role Key使用）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// TypeScript型定義のエクスポート
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          email_verified: string | null;
          image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email: string;
          email_verified?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string;
          email_verified?: string | null;
          image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      couples: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string | null;
          name: string | null;
          invite_code: string | null;
          invite_expires_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id?: string | null;
          name?: string | null;
          invite_code?: string | null;
          invite_expires_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string | null;
          name?: string | null;
          invite_code?: string | null;
          invite_expires_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expense_categories: {
        Row: {
          id: string;
          name: string;
          color: string;
          icon: string;
          is_default: boolean;
          couple_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          couple_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          couple_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          category_id: string;
          amount: number;
          description: string | null;
          date: string;
          receipt_image_url: string | null;
          is_settled: boolean;
          split_ratio: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          user_id: string;
          category_id: string;
          amount: number;
          description?: string | null;
          date: string;
          receipt_image_url?: string | null;
          is_settled?: boolean;
          split_ratio?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          description?: string | null;
          date?: string;
          receipt_image_url?: string | null;
          is_settled?: boolean;
          split_ratio?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settlements: {
        Row: {
          id: string;
          couple_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          period_start: string;
          period_end: string;
          status: string;
          settlement_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          from_user_id: string;
          to_user_id: string;
          amount: number;
          period_start: string;
          period_end: string;
          status?: string;
          settlement_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          amount?: number;
          period_start?: string;
          period_end?: string;
          status?: string;
          settlement_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
