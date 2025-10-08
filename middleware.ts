import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { hasEnoughCredits, TASK_CREDIT_COST } from './lib/quota';
import { TaskType } from './types/database';
import { locales, defaultLocale } from './i18n';

// 创建 i18n 中间件
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // 默认语言不显示前缀
});

// 定义公开访问的路由（Webhooks + 认证页面）
const isPublicRoute = createRouteMatcher([
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/webhooks/lemonsqueezy',
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
  // 对于 API 路由和静态资源，跳过 i18n 处理
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/icon') ||
    req.nextUrl.pathname.includes('/apple-icon')
  ) {
    // Webhook 路由直接放行，不需要认证
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // 只在需要检查积分的 API 路由上执行逻辑
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

      const canProceed = await hasEnoughCredits(userId, taskType);
      if (!canProceed) {
        const required = TASK_CREDIT_COST[taskType];
        return new NextResponse(
          JSON.stringify({ error: `积分不足，当前任务需要 ${required} 积分` }),
          { status: 429 }
        );
      }
    }
    return NextResponse.next();
  }

  // 对于页面路由，应用 i18n 中间件
  const intlResponse = intlMiddleware(req);

  // 如果 intl 中间件返回重定向，直接返回
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // 对于公开路由，直接放行
  if (isPublicRoute(req)) {
    return intlResponse;
  }

  // 其他路由正常处理
  return intlResponse;
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
