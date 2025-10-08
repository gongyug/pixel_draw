import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCheckout, LEMONSQUEEZY_STORE_ID } from '@/lib/lemonsqueezy/client';
import { getPackageById } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutRequest {
  packageId: string; // 套餐 ID
  variantId: string; // Lemon Squeezy 产品变体 ID
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { packageId, variantId }: CheckoutRequest = await request.json();

    // 验证套餐
    const pkg = getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: '无效的套餐 ID' }, { status: 400 });
    }

    if (!LEMONSQUEEZY_STORE_ID) {
      return NextResponse.json({ error: '支付系统配置错误' }, { status: 500 });
    }

    // 创建 checkout
    const checkout = await createCheckout(LEMONSQUEEZY_STORE_ID, variantId, {
      checkoutData: {
        email: '', // Clerk 会提供邮箱，或者从用户信息获取
        custom: {
          user_id: userId,
          package_id: packageId,
        },
      },
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
        desc: true,
        discount: true,
        dark: false,
        subscriptionPreview: false,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      productOptions: {
        name: pkg.name,
        description: pkg.description,
        enabledVariants: [parseInt(variantId)],
      },
    });

    if (!checkout || checkout.error) {
      console.error('创建 checkout 失败:', checkout?.error);
      return NextResponse.json({ error: '创建支付链接失败' }, { status: 500 });
    }

    return NextResponse.json({
      url: checkout.data?.data.attributes.url,
      checkoutId: checkout.data?.data.id,
    });
  } catch (error) {
    console.error('创建 checkout 错误:', error);
    return NextResponse.json(
      {
        error: '创建支付链接失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
