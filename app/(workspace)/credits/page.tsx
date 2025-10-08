'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CREDIT_PACKAGES,
  getTotalCredits,
  getCostPerCredit,
  type CreditPackage,
} from '@/lib/pricing';
import { Check, Zap, Sparkles, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

export default function CreditsPurchasePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!isSignedIn) {
      // 重定向到登录页面
      window.location.href = '/sign-in?redirect_url=/credits';
      return;
    }

    setLoading(pkg.id);

    try {
      const variantId = getVariantId(pkg.id);

      const response = await apiPost('/api/checkout', {
        packageId: pkg.id,
        variantId,
      });

      const data = await response.json();

      if (data.url) {
        // 重定向到 Lemon Squeezy 支付页面
        window.location.href = data.url;
      } else {
        alert('创建支付链接失败，请稍后再试');
        setLoading(null);
      }
    } catch (error) {
      // apiPost 会自动处理 401 错误并重定向
      console.error('购买错误:', error);
      if (error instanceof Error && !error.message.includes('请登录')) {
        alert('购买失败，请稍后再试');
      }
      setLoading(null);
    }
  };

  // 临时函数：映射套餐 ID 到 Lemon Squeezy 变体 ID
  // 实际使用时需要替换为真实的变体 ID
  const getVariantId = (packageId: string): string => {
    const variantMap: Record<string, string> = {
      starter: '123456', // 替换为实际的 variant ID
      basic: '123457',
      pro: '123458',
      enterprise: '123459',
    };
    return variantMap[packageId] || '';
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'starter':
        return <Zap className="h-8 w-8" />;
      case 'basic':
        return <Sparkles className="h-8 w-8" />;
      case 'pro':
        return <Crown className="h-8 w-8" />;
      case 'enterprise':
        return <Crown className="h-8 w-8" />;
      default:
        return <Zap className="h-8 w-8" />;
    }
  };

  const getPackageColor = (id: string) => {
    switch (id) {
      case 'starter':
        return 'from-blue-500 to-cyan-500';
      case 'basic':
        return 'from-purple-500 to-pink-500';
      case 'pro':
        return 'from-orange-500 to-red-500';
      case 'enterprise':
        return 'from-yellow-500 to-amber-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          购买积分
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          选择适合您的积分套餐，永久有效，按需使用
        </p>
      </div>

      {/* 积分使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          积分使用说明
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-300">图片压缩</span>
            <p className="text-gray-600 dark:text-gray-400">1 积分/次</p>
          </div>
          <div>
            <span className="font-medium text-purple-700 dark:text-purple-300">AI 抠图</span>
            <p className="text-gray-600 dark:text-gray-400">2 积分/次</p>
          </div>
          <div>
            <span className="font-medium text-pink-700 dark:text-pink-300">图像识别</span>
            <p className="text-gray-600 dark:text-gray-400">5 积分/次</p>
          </div>
          <div>
            <span className="font-medium text-indigo-700 dark:text-indigo-300">AI 生成</span>
            <p className="text-gray-600 dark:text-gray-400">10 积分/次</p>
          </div>
        </div>
      </div>

      {/* 套餐列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {CREDIT_PACKAGES.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative overflow-hidden transition-all hover:shadow-xl ${
              pkg.popular ? 'ring-2 ring-purple-500 scale-105' : ''
            }`}
          >
            {/* 推荐标签 */}
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                最受欢迎
              </div>
            )}

            {/* 套餐图标 */}
            <div className="p-6">
              <div
                className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getPackageColor(
                  pkg.id
                )} flex items-center justify-center text-white mb-4`}
              >
                {getPackageIcon(pkg.id)}
              </div>

              {/* 套餐名称 */}
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {pkg.description}
              </p>

              {/* 价格 */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">USD</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ≈ ¥{pkg.priceInCNY} CNY
                </div>
                {pkg.bonus && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                    送 {pkg.bonus} 积分
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  约 ${getCostPerCredit(pkg).toFixed(4)}/积分
                </div>
              </div>

              {/* 积分数量 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {getTotalCredits(pkg)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">积分</div>
                </div>
              </div>

              {/* 功能列表 */}
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 购买按钮 */}
              <Button
                onClick={() => handlePurchase(pkg)}
                disabled={loading !== null}
                className={`w-full ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : ''
                }`}
              >
                {loading === pkg.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '立即购买'
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">常见问题</h2>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">积分有效期是多久？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              所有购买的积分永久有效，不会过期。
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">可以退款吗？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              未使用的积分在购买后 7 天内可以申请全额退款。
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">支持哪些支付方式？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支持信用卡、PayPal 等多种国际支付方式。
            </p>
          </Card>
        </div>
      </div>

      {/* 返回链接 */}
      <div className="text-center mt-12">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
