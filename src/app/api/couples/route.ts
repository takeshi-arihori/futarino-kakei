import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  logger.api.request('POST', '/api/couples', undefined, requestId);

  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'カップル名を入力してください' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      logger.error('Service Role Keyが設定されていません', {
        action: 'create_couple',
        feature: 'couples',
        requestId,
      });
      return NextResponse.json({ error: 'サーバー設定エラーが発生しました' }, { status: 500 });
    }

    // ユーザーデータの存在確認
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (userCheckError || !existingUser) {
      logger.info('usersテーブルにユーザーデータが存在しません。作成します。', {
        action: 'create_couple',
        feature: 'users',
        userId: session.user.id,
        requestId,
      });

      // ユーザーデータを作成
      const { error: userCreateError } = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          name: session.user.name || null,
          email: session.user.email || '',
          email_verified: null,
          image: session.user.image || null,
        });

      if (userCreateError) {
        logger.error('ユーザーデータ作成エラー', {
          action: 'create_couple',
          feature: 'users',
          error: userCreateError,
          requestId,
        });
        return NextResponse.json(
          { error: 'ユーザーデータの作成に失敗しました' },
          { status: 500 }
        );
      }

      logger.info('ユーザーデータを作成しました', {
        action: 'create_couple',
        feature: 'users',
        userId: session.user.id,
        requestId,
      });
    }

    // カップル作成
    const { data: coupleData, error: coupleError } = await supabaseAdmin
      .from('couples')
      .insert({
        user1_id: session.user.id,
        user2_id: null,
        name: name.trim(),
      })
      .select()
      .single();

    if (coupleError) {
      logger.error('カップル作成エラー', {
        action: 'create_couple',
        feature: 'couples',
        error: coupleError,
        requestId,
      });
      return NextResponse.json(
        { error: 'カップルの作成に失敗しました' },
        { status: 500 }
      );
    }

    logger.info('カップル作成成功', {
      action: 'create_couple',
      feature: 'couples',
      coupleId: coupleData.id,
      requestId,
    });

    logger.api.response('POST', '/api/couples', 201, undefined, coupleData.id, requestId);
    return NextResponse.json({ couple: coupleData }, { status: 201 });
  } catch (error) {
    logger.api.error('POST', '/api/couples', error as Error, undefined, requestId);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}