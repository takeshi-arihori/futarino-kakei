import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

import { expenseOperations, coupleOperations } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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

    // 支出詳細を取得
    const expense = await expenseOperations.getExpense(resolvedParams.id);
    if (!expense) {
      return NextResponse.json(
        { error: '支出が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（カップルの支出かどうか）
    if (expense.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('支出詳細取得エラー:', error);
    return NextResponse.json(
      { error: '支出詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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

    // 既存の支出を取得
    const existingExpense = await expenseOperations.getExpense(
      resolvedParams.id
    );
    if (!existingExpense) {
      return NextResponse.json(
        { error: '支出が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (existingExpense.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    const { amount, description, category_id, date, split_ratio } = body;

    // バリデーション
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (amount !== undefined) {
      if (amount <= 0) {
        return NextResponse.json(
          { error: '金額は正の数値である必要があります' },
          { status: 400 }
        );
      }
      updates.amount = parseFloat(amount);
    }
    if (description !== undefined) {
      if (description.trim() === '') {
        return NextResponse.json({ error: '説明は必須です' }, { status: 400 });
      }
      updates.description = description.trim();
    }
    if (category_id !== undefined) {
      updates.category_id = category_id || null;
    }
    if (date !== undefined) {
      updates.date = date;
    }
    if (split_ratio !== undefined) {
      if (split_ratio < 0 || split_ratio > 1) {
        return NextResponse.json(
          { error: '分担比率は0から1の間である必要があります' },
          { status: 400 }
        );
      }
      updates.split_ratio = split_ratio;
    }

    // 支出を更新
    const updatedExpense = await expenseOperations.updateExpense(
      resolvedParams.id,
      updates
    );

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('支出更新エラー:', error);
    return NextResponse.json(
      { error: '支出の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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

    // 既存の支出を取得
    const existingExpense = await expenseOperations.getExpense(
      resolvedParams.id
    );
    if (!existingExpense) {
      return NextResponse.json(
        { error: '支出が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (existingExpense.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 精算済みの支出は削除できない
    if (existingExpense.is_settled) {
      return NextResponse.json(
        { error: '精算済みの支出は削除できません' },
        { status: 400 }
      );
    }

    // 支出を削除
    await expenseOperations.deleteExpense(resolvedParams.id);

    return NextResponse.json({ message: '支出を削除しました' });
  } catch (error) {
    console.error('支出削除エラー:', error);
    return NextResponse.json(
      { error: '支出の削除に失敗しました' },
      { status: 500 }
    );
  }
}
