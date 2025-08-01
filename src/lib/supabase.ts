import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from './logger';

const supabaseUrl = env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（Service Role Key使用）
// クライアント側では作成しない
export const supabaseAdmin: ReturnType<typeof createClient> | null = (() => {
  // サーバーサイドでのみ作成
  if (typeof window !== 'undefined') {
    return null; // クライアント側ではnullを返す
  }
  
  const supabaseServiceRoleKey = env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
})();

// クライアント側ではログを出力しない
if (typeof window === 'undefined') {
  // サーバーサイドでのみログ出力
  logger.info('Supabaseクライアント初期化完了', {
    feature: 'supabase',
    action: 'initialize',
    url: supabaseUrl,
    hasServiceRole: !!supabaseAdmin,
  });
}

// TypeScript型定義
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
          updated_at?: string;
        };
      };
      couples: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string | null;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id?: string | null;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string | null;
          name?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          couple_id: string;
          name: string;
          color: string;
          icon: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          name: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          name?: string;
          color?: string;
          icon?: string;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          amount: number;
          description: string;
          category_id: string | null;
          date: string;
          split_ratio: number;
          is_settled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          user_id: string;
          amount: number;
          description: string;
          category_id?: string | null;
          date: string;
          split_ratio?: number;
          is_settled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category_id?: string | null;
          date?: string;
          split_ratio?: number;
          is_settled?: boolean;
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
          note: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
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
          note?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
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
          note?: string | null;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      settlement_expenses: {
        Row: {
          id: string;
          settlement_id: string;
          expense_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          settlement_id: string;
          expense_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          settlement_id?: string;
          expense_id?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          settlement_id: string | null;
          expense_id: string | null;
          read: boolean;
          action_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          settlement_id?: string | null;
          expense_id?: string | null;
          read?: boolean;
          action_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          settlement_id?: string | null;
          expense_id?: string | null;
          read?: boolean;
          action_required?: boolean;
          updated_at?: string;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          email_notifications: boolean;
          push_notifications: boolean;
          reminder_days: number;
          auto_reminder: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          reminder_days?: number;
          auto_reminder?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_notifications?: boolean;
          push_notifications?: boolean;
          reminder_days?: number;
          auto_reminder?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};

// 型付きクライアント
export const typedSupabase = supabase as typeof supabase & {
  from: <T extends keyof Database['public']['Tables']>(
    table: T
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => any;
};

// ヘルパー型
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// 具体的な型エイリアス
export type User = Tables<'users'>;
export type Couple = Tables<'couples'>;
export type Category = Tables<'categories'>;
export type Expense = Tables<'expenses'>;
export type Settlement = Tables<'settlements'>;
export type SettlementExpense = Tables<'settlement_expenses'>;
export type Notification = Tables<'notifications'>;
export type NotificationSettings = Tables<'notification_settings'>;

// 拡張された型（JOINクエリ用）
export type ExpenseWithCategory = Expense & {
  category: Category | null;
  user: Pick<User, 'id' | 'name'>;
};

export type SettlementWithExpenses = Settlement & {
  from_user: Pick<User, 'id' | 'name'>;
  to_user: Pick<User, 'id' | 'name'>;
  settlement_expenses: (SettlementExpense & {
    expense: ExpenseWithCategory;
  })[];
};

export type NotificationWithRelations = Notification & {
  settlement?: Pick<Settlement, 'id' | 'amount'> | null;
  expense?: Pick<Expense, 'id' | 'description' | 'amount'> | null;
};
