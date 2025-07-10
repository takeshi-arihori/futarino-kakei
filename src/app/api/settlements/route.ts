import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

import {
  settlementOperations,
  coupleOperations,
  expenseOperations,
} from '@/lib/database';

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
    const status = searchParams.get('status') || undefined;

    // 精算一覧を取得
    const settlements = await settlementOperations.getCoupleSettlements(
      couple.id,
      {
        limit,
        offset,
        status,
      }
    );

    return NextResponse.json(settlements);
  } catch (error) {
    console.error('精算一覧取得エラー:', error);
    return NextResponse.json(
      { error: '精算一覧の取得に失敗しました' },
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
    const { expense_ids, period_start, period_end, note } = body;

    // バリデーション
    if (
      !expense_ids ||
      !Array.isArray(expense_ids) ||
      expense_ids.length === 0
    ) {
      return NextResponse.json(
        { error: '精算対象の支出を選択してください' },
        { status: 400 }
      );
    }
    if (!period_start || !period_end) {
      return NextResponse.json(
        { error: '精算期間は必須です' },
        { status: 400 }
      );
    }
    if (new Date(period_end) < new Date(period_start)) {
      return NextResponse.json(
        { error: '期間の終了日は開始日より後である必要があります' },
        { status: 400 }
      );
    }

    // 精算対象の支出を取得して計算
    const expenses = await Promise.all(
      expense_ids.map((id: string) => expenseOperations.getExpense(id))
    );

    // 存在しない支出や既に精算済みの支出をチェック
    const validExpenses = expenses.filter(exp => exp !== null);
    if (validExpenses.length !== expense_ids.length) {
      return NextResponse.json(
        { error: '無効な支出が含まれています' },
        { status: 400 }
      );
    }

    const settledExpenses = validExpenses.filter(exp => exp!.is_settled);
    if (settledExpenses.length > 0) {
      return NextResponse.json(
        { error: '既に精算済みの支出が含まれています' },
        { status: 400 }
      );
    }

    // カップルの支出かチェック
    const invalidExpenses = validExpenses.filter(
      exp => exp!.couple_id !== couple.id
    );
    if (invalidExpenses.length > 0) {
      return NextResponse.json(
        { error: 'アクセス権限のない支出が含まれています' },
        { status: 403 }
      );
    }

    // 精算金額を計算
    let user1Payments = 0;
    let user2Payments = 0; // eslint-disable-line @typescript-eslint/no-unused-vars
    let user1Share = 0;
    let user2Share = 0; // eslint-disable-line @typescript-eslint/no-unused-vars

    validExpenses.forEach(expense => {
      const exp = expense!;
      if (exp.user_id === couple.user1_id) {
        user1Payments += exp.amount;
      } else {
        user2Payments += exp.amount;
      }

      user1Share += exp.amount * exp.split_ratio;
      user2Share += exp.amount * (1 - exp.split_ratio);
    });

    // 純収支を計算
    const user1Balance = user1Payments - user1Share;
    // const user2Balance = user2Payments - user2Share; // Currently unused

    // 精算方向と金額を決定
    const settlementAmount = Math.abs(user1Balance);
    const fromUserId = user1Balance > 0 ? couple.user2_id : couple.user1_id;
    const toUserId = user1Balance > 0 ? couple.user1_id : couple.user2_id;

    // 精算額がゼロの場合はエラー
    if (settlementAmount === 0) {
      return NextResponse.json(
        { error: '精算の必要がありません' },
        { status: 400 }
      );
    }

    // 精算を作成
    const newSettlement = await settlementOperations.createSettlement(
      {
        couple_id: couple.id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: settlementAmount,
        period_start,
        period_end,
        status: 'pending',
        note: note || null,
      },
      expense_ids
    );

    return NextResponse.json(newSettlement, { status: 201 });
  } catch (error) {
    console.error('精算作成エラー:', error);
    return NextResponse.json(
      { error: '精算の作成に失敗しました' },
      { status: 500 }
    );
  }
}
