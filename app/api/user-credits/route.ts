import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserCredits } from '@/lib/quota';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log('API /api/user-credits: userId', userId);
    console.log('API /api/user-credits: Request Headers', request.headers);

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const credits = await getUserCredits(userId);

    return NextResponse.json({ credits });
  } catch (error) {
    console.error('获取用户积分错误:', error);
    return NextResponse.json(
      {
        error: '获取积分失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
