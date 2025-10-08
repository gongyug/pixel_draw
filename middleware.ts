import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasEnoughCredits, TASK_CREDIT_COST } from './lib/quota';
import { TaskType } from './types/database';

// 定义公开访问的路由（Marketing页面 + Webhooks + 认证页面）
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/webhooks/lemonsqueezy',
]);

// 定义需要认证的工作台路由
const isWorkspaceRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/compress(.*)',
  '/remove-bg(.*)',
  '/recognition(.*)',
  '/generate(.*)',
  '/credits(.*)',
  '/credit-history(.*)',
  '/user-profile(.*)',
]);

// 定义需要检查积分的 API 路由（消耗积分的操作）
const isCreditRoute = createRouteMatcher([
  '/api/remove-bg',
  '/api/recognize',
  '/api/generate',
  '/api/compress',
]);

// 路由到任务类型的映射
const pathToTaskType: Record<string, TaskType> = {
  '/api/remove-bg': 'remove_bg',
  '/api/recognize': 'recognize',
  '/api/generate': 'generate',
  '/api/compress': 'compress',
};

export default clerkMiddleware(async (auth, req) => {
  // 公开路由直接放行
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 保护工作台路由 - 未登录自动重定向到登录页
  if (isWorkspaceRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 检查积分的 API 路由
  if (isCreditRoute(req)) {
    const { userId } = await auth();
    // 对于 API 路由，如果未认证，返回 401 错误
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: '请先登录以使用此功能' }), { status: 401 });
    }

    const taskType = pathToTaskType[req.nextUrl.pathname];
    if (!taskType) {
      return new NextResponse(JSON.stringify({ error: '无效的任务类型' }), { status: 400 });
    }

    // 检查积分是否足够
    const canProceed = await hasEnoughCredits(userId, taskType);
    if (!canProceed) {
      const required = TASK_CREDIT_COST[taskType];
      return new NextResponse(
        JSON.stringify({ error: `积分不足，当前任务需要 ${required} 积分` }),
        { status: 429 }
      );
    }
  }

  // 其他路由正常放行
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This pattern allows the middleware to run on all pages and API routes,
     * ensuring API routes are protected while pages remain accessible.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
