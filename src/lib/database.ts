import { supabase } from './supabase';
import type {
  User,
  Couple,
  Category,
  Expense,
  Settlement,
  SettlementExpense,
  Notification,
  NotificationSettings,
  ExpenseWithCategory,
  SettlementWithExpenses,
  Inserts,
  Updates,
} from './supabase';

// エラーハンドリング用のヘルパー
class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ユーザー関連の操作
export const userOperations = {
  // ユーザー情報の取得
  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw new DatabaseError('ユーザー情報の取得に失敗しました', error);
      return data;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
  },

  // ユーザー情報の作成・更新
  async upsertUser(userData: Inserts<'users'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw new DatabaseError('ユーザー情報の保存に失敗しました', error);
      return data;
    } catch (error) {
      console.error('ユーザー保存エラー:', error);
      throw error;
    }
  },

  // ユーザー情報の更新
  async updateUser(userId: string, updates: Updates<'users'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new DatabaseError('ユーザー情報の更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      throw error;
    }
  },
};

// カップル関連の操作
export const coupleOperations = {
  // ユーザーのカップル情報を取得
  async getUserCouple(userId: string): Promise<Couple | null> {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError('カップル情報の取得に失敗しました', error);
      }
      return data || null;
    } catch (error) {
      console.error('カップル取得エラー:', error);
      throw error;
    }
  },

  // カップルの作成
  async createCouple(user1Id: string, user2Id: string, name?: string): Promise<Couple> {
    try {
      const { data, error } = await supabase
        .from('couples')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          name: name || null,
        })
        .select()
        .single();

      if (error) throw new DatabaseError('カップル関係の作成に失敗しました', error);
      return data;
    } catch (error) {
      console.error('カップル作成エラー:', error);
      throw error;
    }
  },

  // カップル情報の更新
  async updateCouple(coupleId: string, updates: Updates<'couples'>): Promise<Couple> {
    try {
      const { data, error } = await supabase
        .from('couples')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', coupleId)
        .select()
        .single();

      if (error) throw new DatabaseError('カップル情報の更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('カップル更新エラー:', error);
      throw error;
    }
  },
};

// カテゴリ関連の操作
export const categoryOperations = {
  // カップルのカテゴリ一覧を取得
  async getCoupleCategories(coupleId: string): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw new DatabaseError('カテゴリ一覧の取得に失敗しました', error);
      return data || [];
    } catch (error) {
      console.error('カテゴリ取得エラー:', error);
      throw error;
    }
  },

  // カテゴリの作成
  async createCategory(categoryData: Inserts<'categories'>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw new DatabaseError('カテゴリの作成に失敗しました', error);
      return data;
    } catch (error) {
      console.error('カテゴリ作成エラー:', error);
      throw error;
    }
  },

  // カテゴリの更新
  async updateCategory(categoryId: string, updates: Updates<'categories'>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw new DatabaseError('カテゴリの更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('カテゴリ更新エラー:', error);
      throw error;
    }
  },

  // カテゴリの削除
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw new DatabaseError('カテゴリの削除に失敗しました', error);
    } catch (error) {
      console.error('カテゴリ削除エラー:', error);
      throw error;
    }
  },
};

// 支出関連の操作
export const expenseOperations = {
  // カップルの支出一覧を取得
  async getCoupleExpenses(
    coupleId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      isSettled?: boolean;
      categoryId?: string;
    }
  ): Promise<ExpenseWithCategory[]> {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*),
          user:users(id, name)
        `)
        .eq('couple_id', coupleId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }
      if (options?.isSettled !== undefined) {
        query = query.eq('is_settled', options.isSettled);
      }
      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw new DatabaseError('支出一覧の取得に失敗しました', error);
      return data || [];
    } catch (error) {
      console.error('支出取得エラー:', error);
      throw error;
    }
  },

  // 支出の詳細を取得
  async getExpense(expenseId: string): Promise<ExpenseWithCategory | null> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*),
          user:users(id, name)
        `)
        .eq('id', expenseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError('支出詳細の取得に失敗しました', error);
      }
      return data || null;
    } catch (error) {
      console.error('支出詳細取得エラー:', error);
      throw error;
    }
  },

  // 支出の作成
  async createExpense(expenseData: Inserts<'expenses'>): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) throw new DatabaseError('支出の作成に失敗しました', error);
      return data;
    } catch (error) {
      console.error('支出作成エラー:', error);
      throw error;
    }
  },

  // 支出の更新
  async updateExpense(expenseId: string, updates: Updates<'expenses'>): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw new DatabaseError('支出の更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('支出更新エラー:', error);
      throw error;
    }
  },

  // 支出の削除
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw new DatabaseError('支出の削除に失敗しました', error);
    } catch (error) {
      console.error('支出削除エラー:', error);
      throw error;
    }
  },

  // 未精算の支出を取得
  async getUnsettledExpenses(coupleId: string): Promise<ExpenseWithCategory[]> {
    return this.getCoupleExpenses(coupleId, { isSettled: false });
  },
};

// 精算関連の操作
export const settlementOperations = {
  // カップルの精算一覧を取得
  async getCoupleSettlements(
    coupleId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<SettlementWithExpenses[]> {
    try {
      let query = supabase
        .from('settlements')
        .select(`
          *,
          from_user:users!settlements_from_user_id_fkey(id, name),
          to_user:users!settlements_to_user_id_fkey(id, name),
          settlement_expenses(
            *,
            expense:expenses(
              *,
              category:categories(*),
              user:users(id, name)
            )
          )
        `)
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw new DatabaseError('精算一覧の取得に失敗しました', error);
      return data || [];
    } catch (error) {
      console.error('精算取得エラー:', error);
      throw error;
    }
  },

  // 精算の詳細を取得
  async getSettlement(settlementId: string): Promise<SettlementWithExpenses | null> {
    try {
      const { data, error } = await supabase
        .from('settlements')
        .select(`
          *,
          from_user:users!settlements_from_user_id_fkey(id, name),
          to_user:users!settlements_to_user_id_fkey(id, name),
          settlement_expenses(
            *,
            expense:expenses(
              *,
              category:categories(*),
              user:users(id, name)
            )
          )
        `)
        .eq('id', settlementId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError('精算詳細の取得に失敗しました', error);
      }
      return data || null;
    } catch (error) {
      console.error('精算詳細取得エラー:', error);
      throw error;
    }
  },

  // 精算の作成
  async createSettlement(
    settlementData: Inserts<'settlements'>,
    expenseIds: string[]
  ): Promise<Settlement> {
    try {
      // トランザクションで精算と関連する支出を作成
      const { data: settlement, error: settlementError } = await supabase
        .from('settlements')
        .insert(settlementData)
        .select()
        .single();

      if (settlementError) {
        throw new DatabaseError('精算の作成に失敗しました', settlementError);
      }

      // 精算対象の支出を関連付け
      const settlementExpenses = expenseIds.map(expenseId => ({
        settlement_id: settlement.id,
        expense_id: expenseId,
      }));

      const { error: expensesError } = await supabase
        .from('settlement_expenses')
        .insert(settlementExpenses);

      if (expensesError) {
        throw new DatabaseError('精算対象支出の関連付けに失敗しました', expensesError);
      }

      return settlement;
    } catch (error) {
      console.error('精算作成エラー:', error);
      throw error;
    }
  },

  // 精算の更新
  async updateSettlement(settlementId: string, updates: Updates<'settlements'>): Promise<Settlement> {
    try {
      const { data, error } = await supabase
        .from('settlements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', settlementId)
        .select()
        .single();

      if (error) throw new DatabaseError('精算の更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('精算更新エラー:', error);
      throw error;
    }
  },

  // 精算の完了
  async completeSettlement(settlementId: string): Promise<Settlement> {
    return this.updateSettlement(settlementId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  // 精算のキャンセル
  async cancelSettlement(settlementId: string): Promise<Settlement> {
    return this.updateSettlement(settlementId, {
      status: 'cancelled',
    });
  },
};

// 通知関連の操作
export const notificationOperations = {
  // ユーザーの通知一覧を取得
  async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('read', false);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw new DatabaseError('通知一覧の取得に失敗しました', error);
      return data || [];
    } catch (error) {
      console.error('通知取得エラー:', error);
      throw error;
    }
  },

  // 通知の作成
  async createNotification(notificationData: Inserts<'notifications'>): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw new DatabaseError('通知の作成に失敗しました', error);
      return data;
    } catch (error) {
      console.error('通知作成エラー:', error);
      throw error;
    }
  },

  // 通知を既読にする
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw new DatabaseError('通知の既読処理に失敗しました', error);
      return data;
    } catch (error) {
      console.error('通知既読エラー:', error);
      throw error;
    }
  },

  // 全通知を既読にする
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw new DatabaseError('全通知の既読処理に失敗しました', error);
    } catch (error) {
      console.error('全通知既読エラー:', error);
      throw error;
    }
  },

  // ユーザーの通知設定を取得
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new DatabaseError('通知設定の取得に失敗しました', error);
      }
      return data || null;
    } catch (error) {
      console.error('通知設定取得エラー:', error);
      throw error;
    }
  },

  // 通知設定の更新
  async updateNotificationSettings(
    userId: string,
    updates: Updates<'notification_settings'>
  ): Promise<NotificationSettings> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: userId,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw new DatabaseError('通知設定の更新に失敗しました', error);
      return data;
    } catch (error) {
      console.error('通知設定更新エラー:', error);
      throw error;
    }
  },
};

// 統計関連の操作
export const statisticsOperations = {
  // 支出統計を取得
  async getExpenseStatistics(
    coupleId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalAmount: number;
    totalCount: number;
    categoryBreakdown: Array<{
      category_id: string;
      category_name: string;
      total_amount: number;
      count: number;
    }>;
  }> {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          amount,
          category:categories(id, name)
        `)
        .eq('couple_id', coupleId);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw new DatabaseError('支出統計の取得に失敗しました', error);

      const expenses = data || [];
      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalCount = expenses.length;

      // カテゴリ別の集計
      const categoryMap = new Map();
      expenses.forEach(exp => {
        const categoryId = exp.category?.id || 'uncategorized';
        const categoryName = exp.category?.name || 'カテゴリなし';
        
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            category_id: categoryId,
            category_name: categoryName,
            total_amount: 0,
            count: 0,
          });
        }
        
        const category = categoryMap.get(categoryId);
        category.total_amount += exp.amount;
        category.count += 1;
      });

      return {
        totalAmount,
        totalCount,
        categoryBreakdown: Array.from(categoryMap.values()),
      };
    } catch (error) {
      console.error('支出統計取得エラー:', error);
      throw error;
    }
  },

  // 精算統計を取得
  async getSettlementStatistics(
    coupleId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalSettlements: number;
    totalAmount: number;
    completedCount: number;
    pendingCount: number;
  }> {
    try {
      let query = supabase
        .from('settlements')
        .select('amount, status')
        .eq('couple_id', coupleId);

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;

      if (error) throw new DatabaseError('精算統計の取得に失敗しました', error);

      const settlements = data || [];
      const totalSettlements = settlements.length;
      const totalAmount = settlements.reduce((sum, settlement) => sum + settlement.amount, 0);
      const completedCount = settlements.filter(s => s.status === 'completed').length;
      const pendingCount = settlements.filter(s => s.status === 'pending').length;

      return {
        totalSettlements,
        totalAmount,
        completedCount,
        pendingCount,
      };
    } catch (error) {
      console.error('精算統計取得エラー:', error);
      throw error;
    }
  },
};