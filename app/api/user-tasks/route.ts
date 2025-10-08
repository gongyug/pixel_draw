import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseService } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data, error } = await supabaseService
      .from('tasks')
      .select('id, task_type, status, created_at, credits_used')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('获取用户任务失败:', error);
      return NextResponse.json(
        { error: '获取任务失败', details: error.message },
        { status: 500 }
      );
    }

    // Map task_type to the frontend's expected type
    const mappedTasks = (data || []).map((task: any) => ({
      id: task.id,
      type: task.task_type as 'compress' | 'remove_bg' | 'recognize' | 'generate',
      timestamp: task.created_at,
      status: task.status as 'success' | 'failed',
      creditsUsed: task.credits_used || 0,
    }));

    return NextResponse.json({ tasks: mappedTasks });
  } catch (error) {
    console.error('获取用户任务错误:', error);
    return NextResponse.json(
      {
        error: '获取任务失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
