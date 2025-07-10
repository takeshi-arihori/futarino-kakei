import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { categoryOperations, coupleOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  console.log('Categories GET request:', request.url); // TODO: Remove in production
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのカップル情報を取得
    const couple = await coupleOperations.getUserCouple(session.user.id);
    if (!couple) {
      return NextResponse.json(
        { error: 'カップル関係が見つかりません' },
        { status: 404 }
      );
    }

    // カテゴリ一覧を取得
    const categories = await categoryOperations.getCoupleCategories(couple.id);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('カテゴリ一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリ一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // ユーザーのカップル情報を取得
    const couple = await coupleOperations.getUserCouple(session.user.id);
    if (!couple) {
      return NextResponse.json(
        { error: 'カップル関係が見つかりません' },
        { status: 404 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    const { name, color, icon } = body;

    // バリデーション
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'カテゴリ名は必須です' },
        { status: 400 }
      );
    }

    // カテゴリを作成
    const newCategory = await categoryOperations.createCategory({
      couple_id: couple.id,
      name: name.trim(),
      color: color || 'bg-gray-100 text-gray-800',
      icon: icon || '📦',
      is_default: false,
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('カテゴリ作成エラー:', error);

    // 重複エラーのハンドリング
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: '同じ名前のカテゴリが既に存在します' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'カテゴリの作成に失敗しました' },
      { status: 500 }
    );
  }
}
