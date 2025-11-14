import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

// 定义需要认证的 API 路由
const isProtectedApiRoute = createRouteMatcher([
  '/api/remove-bg',
  '/api/recognize',
  '/api/generate',
  '/api/compress',
  '/api/user-credits',
  '/api/user-tasks',
  '/api/credit-history',
  '/api/checkout',
]);

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

  // 保护 API 路由 - 需要认证
  if (isProtectedApiRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: '请先登录以使用此功能' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
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
