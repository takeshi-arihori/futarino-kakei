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

      if (userError) {
        // usersテーブルにデータがない場合、セッションから基本情報を使用
        if (userError.code === 'PGRST116' && session?.user) {
          console.warn('usersテーブルにデータが存在しません。セッション情報を使用します。');
          const fallbackUser: User = {
            id: session.user.id!,
            name: session.user.name || null,
            email: session.user.email!,
            email_verified: null,
            image: session.user.image || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
        } else {
          console.error('usersテーブルからのデータ取得エラー:', userError);
          throw userError;
        }
      } else {
        setUser(userData);
      }

      // カップル情報を取得（簡潔なクエリで確認）
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .maybeSingle();

      if (coupleError) {
        console.error('couplesテーブルからのデータ取得エラー:', coupleError);
        // カップル情報の取得エラーは致命的ではないので、継続
        setCouple(null);
      } else {
        setCouple(coupleData || null);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      // エラーの詳細情報をログに出力
      if (err && typeof err === 'object' && 'message' in err) {
        console.error('エラーメッセージ:', (err as Error).message);
      }
      if (err && typeof err === 'object' && 'code' in err) {
        console.error('エラーコード:', (err as any).code);
      }
      if (err && typeof err === 'object' && 'details' in err) {
        console.error('エラー詳細:', (err as any).details);
      }
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

      console.log('カップル作成開始 - ユーザーID:', session.user.id);
      console.log('カップル名:', name);

      // サーバーサイドAPIでカップルを作成
      const response = await fetch('/api/couples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カップルの作成に失敗しました');
      }

      const { couple } = await response.json();
      console.log('カップル作成成功:', couple);

      await refreshUserData();
      return couple;
    } catch (err) {
      console.error('createCouple function error:', err);
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
