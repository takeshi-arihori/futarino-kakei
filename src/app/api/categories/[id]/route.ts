import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { categoryOperations, coupleOperations, supabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのカップル情報を取得
    const couple = await coupleOperations.getUserCouple(session.user.id);
    if (!couple) {
      return NextResponse.json({ error: 'カップル関係が見つかりません' }, { status: 404 });
    }

    // カテゴリ詳細を取得
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !category) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    // 権限チェック（カップルのカテゴリかどうか）
    if (category.couple_id !== couple.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('カテゴリ詳細取得エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリ詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのカップル情報を取得
    const couple = await coupleOperations.getUserCouple(session.user.id);
    if (!couple) {
      return NextResponse.json({ error: 'カップル関係が見つかりません' }, { status: 404 });
    }

    // 既存のカテゴリを取得
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    // 権限チェック
    if (existingCategory.couple_id !== couple.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // デフォルトカテゴリは編集できない
    if (existingCategory.is_default) {
      return NextResponse.json({ error: 'デフォルトカテゴリは編集できません' }, { status: 400 });
    }

    // リクエストボディの解析
    const body = await request.json();
    const { name, color, icon } = body;

    // バリデーション
    const updates: any = {};
    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 });
      }
      updates.name = name.trim();
    }
    if (color !== undefined) {
      updates.color = color;
    }
    if (icon !== undefined) {
      updates.icon = icon;
    }

    // カテゴリを更新
    const updatedCategory = await categoryOperations.updateCategory(params.id, updates);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('カテゴリ更新エラー:', error);
    
    // 重複エラーのハンドリング
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: '同じ名前のカテゴリが既に存在します' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'カテゴリの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのカップル情報を取得
    const couple = await coupleOperations.getUserCouple(session.user.id);
    if (!couple) {
      return NextResponse.json({ error: 'カップル関係が見つかりません' }, { status: 404 });
    }

    // 既存のカテゴリを取得
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    // 権限チェック
    if (existingCategory.couple_id !== couple.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // デフォルトカテゴリは削除できない
    if (existingCategory.is_default) {
      return NextResponse.json({ error: 'デフォルトカテゴリは削除できません' }, { status: 400 });
    }

    // このカテゴリを使用している支出があるかチェック
    const { data: expensesUsingCategory, error: expenseError } = await supabase
      .from('expenses')
      .select('id')
      .eq('category_id', params.id)
      .limit(1);

    if (expenseError) {
      throw expenseError;
    }

    if (expensesUsingCategory && expensesUsingCategory.length > 0) {
      return NextResponse.json(
        { error: 'このカテゴリを使用している支出があるため削除できません' },
        { status: 400 }
      );
    }

    // カテゴリを削除
    await categoryOperations.deleteCategory(params.id);

    return NextResponse.json({ message: 'カテゴリを削除しました' });
  } catch (error) {
    console.error('カテゴリ削除エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリの削除に失敗しました' },
      { status: 500 }
    );
  }
}