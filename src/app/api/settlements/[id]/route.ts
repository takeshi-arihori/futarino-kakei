import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

import { settlementOperations, coupleOperations } from '@/lib/database';

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

    // 精算詳細を取得
    const settlement = await settlementOperations.getSettlement(
      resolvedParams.id
    );
    if (!settlement) {
      return NextResponse.json(
        { error: '精算が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（カップルの精算かどうか）
    if (settlement.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json(settlement);
  } catch (error) {
    console.error('精算詳細取得エラー:', error);
    return NextResponse.json(
      { error: '精算詳細の取得に失敗しました' },
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

    // 既存の精算を取得
    const existingSettlement = await settlementOperations.getSettlement(
      resolvedParams.id
    );
    if (!existingSettlement) {
      return NextResponse.json(
        { error: '精算が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (existingSettlement.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // リクエストボディの解析
    const body = await request.json();
    const { status, note } = body;

    // バリデーション
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (status !== undefined) {
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: '無効なステータスです' },
          { status: 400 }
        );
      }

      // 既に完了またはキャンセルされた精算は変更できない
      if (existingSettlement.status !== 'pending') {
        return NextResponse.json(
          { error: 'この精算は既に処理済みです' },
          { status: 400 }
        );
      }

      updates.status = status;

      // 完了時は完了日時を設定
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (note !== undefined) {
      updates.note = note || null;
    }

    // 精算を更新
    const updatedSettlement = await settlementOperations.updateSettlement(
      resolvedParams.id,
      updates
    );

    return NextResponse.json(updatedSettlement);
  } catch (error) {
    console.error('精算更新エラー:', error);
    return NextResponse.json(
      { error: '精算の更新に失敗しました' },
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

    // 既存の精算を取得
    const existingSettlement = await settlementOperations.getSettlement(
      resolvedParams.id
    );
    if (!existingSettlement) {
      return NextResponse.json(
        { error: '精算が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (existingSettlement.couple_id !== couple.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 完了済みの精算は削除できない
    if (existingSettlement.status === 'completed') {
      return NextResponse.json(
        { error: '完了済みの精算は削除できません' },
        { status: 400 }
      );
    }

    // 精算をキャンセル状態に更新（物理削除ではなく論理削除）
    await settlementOperations.cancelSettlement(resolvedParams.id);

    return NextResponse.json({ message: '精算をキャンセルしました' });
  } catch (error) {
    console.error('精算削除エラー:', error);
    return NextResponse.json(
      { error: '精算の削除に失敗しました' },
      { status: 500 }
    );
  }
}
