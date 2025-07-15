import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.api.request('POST', '/api/auth/signup', undefined, requestId);

  try {
    const body = await request.json();
    const { email, password, name } = body;

    // バリデーション
    if (!email || !password || !name) {
      logger.warn('ユーザー登録失敗: 必須フィールド不足', {
        action: 'signup',
        feature: 'auth',
        requestId,
        missing_fields: {
          email: !email,
          password: !password,
          name: !name,
        },
      });
      return NextResponse.json(
        { error: 'メール、パスワード、名前はすべて必須です' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      logger.warn('ユーザー登録失敗: パスワードが短すぎる', {
        action: 'signup',
        feature: 'auth',
        email:
          email.split('@')[0].substring(0, 2) + '***@' + email.split('@')[1],
        requestId,
        reason: 'password_too_short',
      });
      return NextResponse.json(
        { error: 'パスワードは8文字以上である必要があります' },
        { status: 400 }
      );
    }

    // Supabase Authでユーザー作成
    // 開発環境では管理者APIを使用してメール確認をスキップ
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // 開発環境で管理者APIを使用するドメインリスト
    const allowedDomains = [
      '@gmail.com',
      '@yahoo.com', 
      '@outlook.com',
      '@hotmail.com',
      '@example.com',
      '@test.com',
      '@localhost',
      '@dev.local'
    ];
    
    const isAllowedDomain = allowedDomains.some(domain => email.includes(domain));
    
    let authData, authError;
    
    if (isDevelopment && isAllowedDomain && supabaseAdmin) {
      // 開発環境で許可されたメールドメインの場合は管理者APIを使用
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // メール確認をスキップ
        user_metadata: {
          name: name,
        },
      });
      authData = { user: data.user, session: null };
      authError = error;
      
      if (!error) {
        logger.info('開発環境: 管理者APIでユーザー作成', {
          action: 'signup',
          feature: 'auth',
          email: email.split('@')[0].substring(0, 2) + '***@' + email.split('@')[1],
          requestId,
          method: 'admin_api',
          domain: email.split('@')[1],
        });
      }
    } else {
      // 本番環境または通常のフローを使用
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      authData = data;
      authError = error;
    }

    if (authError) {
      logger.auth.signup(email, false, authError);

      // エラーメッセージの日本語化
      let errorMessage = 'ユーザー登録に失敗しました';
      if (authError.message.includes('User already registered')) {
        errorMessage = 'このメールアドレスは既に登録されています';
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'パスワードは8文字以上である必要があります';
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = '有効なメールアドレスを入力してください';
      } else if (authError.message.includes('Email rate limit exceeded')) {
        errorMessage =
          'メール送信の制限に達しました。しばらく時間をおいてから再試行してください';
      }

      logger.api.response(
        'POST',
        '/api/auth/signup',
        400,
        undefined,
        undefined,
        requestId
      );
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (!authData.user) {
      logger.error('ユーザー登録失敗: ユーザーデータが空', {
        action: 'signup',
        feature: 'auth',
        email:
          email.split('@')[0].substring(0, 2) + '***@' + email.split('@')[1],
        requestId,
      });
      logger.api.response(
        'POST',
        '/api/auth/signup',
        500,
        undefined,
        undefined,
        requestId
      );
      return NextResponse.json(
        { error: 'ユーザー作成に失敗しました' },
        { status: 500 }
      );
    }

    // usersテーブルにユーザー情報を保存（Service Role Keyを使用してRLSを回避）
    if (!supabaseAdmin) {
      logger.error('Service Role Keyが設定されていません', {
        action: 'signup',
        feature: 'database',
        userId: authData.user.id,
        requestId,
        solution: 'SUPABASE_SERVICE_ROLE_KEYを.env.localに設定してください',
      });
      return NextResponse.json(
        { error: 'サーバー設定エラーが発生しました' },
        { status: 500 }
      );
    }

    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email: authData.user.email,
      name: name,
      email_verified: authData.user.email_confirmed_at,
      image: null,
    });

    if (dbError) {
      logger.database.query('users', 'insert', false, dbError);
      logger.error('ユーザー情報のDB保存に失敗（Authは成功）', {
        action: 'signup',
        feature: 'auth',
        userId: authData.user.id,
        email:
          email.split('@')[0].substring(0, 2) + '***@' + email.split('@')[1],
        requestId,
        rlsIssue: dbError.message.includes('row-level security'),
        usingServiceRole: !!supabaseAdmin,
      });
      
      // RLSエラーの場合、特別な対応
      if (dbError.message.includes('row-level security')) {
        logger.warn('RLSポリシーによるアクセス拒否が発生しました', {
          action: 'signup',
          feature: 'database',
          table: 'users',
          suggestion: 'SupabaseダッシュボードでusersテーブルのRLSポリシーを確認してください',
        });
      }
      
      // Auth側のユーザーは作成されているが、DBエラーの場合
      // NextAuth.jsが自動的にユーザー情報を同期するので、エラーとしない
    } else {
      logger.database.query('users', 'insert', true);
      logger.info('ユーザー情報をusersテーブルに正常保存', {
        action: 'signup',
        feature: 'database',
        userId: authData.user.id,
        requestId,
      });
    }

    logger.auth.signup(email, true);
    logger.api.response(
      'POST',
      '/api/auth/signup',
      201,
      undefined,
      authData.user.id,
      requestId
    );

    // メッセージを環境に応じて変更
    const message = isDevelopment && authData.user.email_confirmed_at
      ? 'ユーザー登録が完了しました。すぐにログインできます。'
      : 'ユーザー登録が完了しました。メールを確認してアカウントを有効化してください。';

    return NextResponse.json(
      {
        message,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          emailConfirmed: !!authData.user.email_confirmed_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.api.error(
      'POST',
      '/api/auth/signup',
      error as Error,
      undefined,
      requestId
    );
    logger.api.response(
      'POST',
      '/api/auth/signup',
      500,
      undefined,
      undefined,
      requestId
    );
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
