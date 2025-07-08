'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from './supabase';
import type { User, Couple } from '@/types';

interface AuthContextType {
  user: User | null;
  couple: Couple | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  createCouple: (name: string) => Promise<Couple>;
  joinCouple: (inviteCode: string) => Promise<Couple>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーデータとカップル情報を取得
  const fetchUserData = async (userId: string) => {
    try {
      setError(null);

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      setUser(userData);

      // カップル情報を取得
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select(
          `
          *,
          user1:users!couples_user1_id_fkey(id, name, email, image),
          user2:users!couples_user2_id_fkey(id, name, email, image)
        `
        )
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .single();

      if (coupleError && coupleError.code !== 'PGRST116') {
        // PGRST116 は "no rows returned" エラー（カップルが存在しない場合）
        throw coupleError;
      }

      setCouple(coupleData || null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(
        err instanceof Error ? err.message : 'データの取得に失敗しました'
      );
    }
  };

  const refreshUserData = async () => {
    if (session?.user?.id) {
      await fetchUserData(session.user.id);
    }
  };

  // カップル作成
  const createCouple = async (name: string): Promise<Couple> => {
    if (!session?.user?.id) {
      throw new Error('ログインが必要です');
    }

    try {
      setError(null);

      // 招待コード生成
      const { data: inviteCodeData, error: codeError } = await supabase.rpc(
        'generate_invite_code'
      );

      if (codeError) throw codeError;

      // カップル作成
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .insert({
          user1_id: session.user.id,
          name,
          invite_code: inviteCodeData,
          invite_expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7日後
          status: 'pending',
        })
        .select()
        .single();

      if (coupleError) throw coupleError;

      await refreshUserData();
      return coupleData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'カップルの作成に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // カップル参加
  const joinCouple = async (inviteCode: string): Promise<Couple> => {
    if (!session?.user?.id) {
      throw new Error('ログインが必要です');
    }

    try {
      setError(null);

      // 招待コードでカップルを検索
      const { data: coupleData, error: findError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .gt('invite_expires_at', new Date().toISOString())
        .single();

      if (findError || !coupleData) {
        throw new Error('有効な招待コードが見つかりません');
      }

      // カップルに参加
      const { data: updatedCouple, error: updateError } = await supabase
        .from('couples')
        .update({
          user2_id: session.user.id,
          status: 'active',
          invite_code: null,
          invite_expires_at: null,
        })
        .eq('id', coupleData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await refreshUserData();
      return updatedCouple;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'カップルへの参加に失敗しました';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData(session.user.id).finally(() => setLoading(false));
    } else {
      setUser(null);
      setCouple(null);
      setLoading(false);
    }
  }, [session, status]);

  const value: AuthContextType = {
    user,
    couple,
    loading: status === 'loading' || loading,
    error,
    refreshUserData,
    createCouple,
    joinCouple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
