import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'メール、パスワード、名前はすべて必須です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      );
    }

    // Supabase Authでユーザー作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      
      // エラーメッセージの日本語化
      let errorMessage = 'ユーザー登録に失敗しました';
      if (authError.message.includes('User already registered')) {
        errorMessage = 'このメールアドレスは既に登録されています';
      } else if (authError.message.includes('Password should be at least')) {
        errorMessage = 'パスワードは6文字以上である必要があります';
      } else if (authError.message.includes('Invalid email')) {
        errorMessage = '有効なメールアドレスを入力してください';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'ユーザー作成に失敗しました' },
        { status: 500 }
      );
    }

    // usersテーブルにユーザー情報を保存
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        email_verified: authData.user.email_confirmed_at,
        image: null,
      });

    if (dbError) {
      console.error('Database Error:', dbError);
      // Auth側のユーザーは作成されているが、DBエラーの場合
      // NextAuth.jsが自動的にユーザー情報を同期するので、エラーとしない
    }

    return NextResponse.json(
      {
        message: 'ユーザー登録が完了しました。メールを確認してアカウントを有効化してください。',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}