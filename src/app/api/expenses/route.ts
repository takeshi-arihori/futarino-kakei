import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

import { expenseOperations, coupleOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
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

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const isSettled =
      searchParams.get('isSettled') === 'true'
        ? true
        : searchParams.get('isSettled') === 'false'
          ? false
          : undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    // 支出一覧を取得
    const expenses = await expenseOperations.getCoupleExpenses(couple.id, {
      limit,
      offset,
      startDate,
      endDate,
      isSettled,
      categoryId,
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('支出一覧取得エラー:', error);
    return NextResponse.json(
      { error: '支出一覧の取得に失敗しました' },
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
    const { amount, description, category_id, date, split_ratio } = body;

    // バリデーション
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '金額は正の数値である必要があります' },
        { status: 400 }
      );
    }
    if (!description || description.trim() === '') {
      return NextResponse.json({ error: '説明は必須です' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: '日付は必須です' }, { status: 400 });
    }
    if (split_ratio && (split_ratio < 0 || split_ratio > 1)) {
      return NextResponse.json(
        { error: '分担比率は0から1の間である必要があります' },
        { status: 400 }
      );
    }

    // 支出を作成
    const newExpense = await expenseOperations.createExpense({
      couple_id: couple.id,
      user_id: session.user.id,
      amount: parseFloat(amount),
      description: description.trim(),
      category_id: category_id || null,
      date,
      split_ratio: split_ratio || 0.5,
      is_settled: false,
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('支出作成エラー:', error);
    return NextResponse.json(
      { error: '支出の作成に失敗しました' },
      { status: 500 }
    );
  }
}
