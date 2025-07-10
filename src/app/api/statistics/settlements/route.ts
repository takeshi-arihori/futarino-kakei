import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { statisticsOperations, coupleOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
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

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // 精算統計を取得
    const statistics = await statisticsOperations.getSettlementStatistics(
      couple.id,
      startDate,
      endDate
    );

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('精算統計取得エラー:', error);
    return NextResponse.json(
      { error: '精算統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}