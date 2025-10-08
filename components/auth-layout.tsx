'use client';

import {
  Sparkles,
  Zap,
  Shield,
  Gift,
  Crown,
  Check,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Gift,
    title: '免费积分',
    description: '注册即送 20 积分，立即开始体验',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
  },
  {
    icon: Zap,
    title: '智能工具',
    description: '图片压缩、AI 抠图、图像识别、AI 生图',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    icon: Crown,
    title: '数据保存',
    description: '任务记录永久保存，随时查看历史',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '企业级安全保障，数据加密传输',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-200/20 to-transparent rounded-full blur-3xl dark:from-pink-500/10" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl dark:from-blue-500/10" />
      </div>

      <div className="relative min-h-screen grid lg:grid-cols-2 gap-0">
        {/* 左侧 - 权益介绍 */}
        <div className="hidden lg:flex p-12 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 text-white backdrop-blur-sm">
          <div className="w-full max-w-lg mx-auto flex flex-col justify-between">
            <div>
              {/* Logo 和返回按钮 */}
              <div className="flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur shadow-sm">
                    <span className="text-xl font-bold">P</span>
                  </div>
                  <span className="text-2xl font-bold">PixelDraw</span>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回首页
                  </Button>
                </Link>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                PixelDraw AI
              </div>

              <h2 className="text-4xl font-bold mb-4">
                欢迎来到 PixelDraw
              </h2>
              <p className="text-blue-100 mb-12 text-lg">
                专业的 AI 图像处理平台，为您提供一站式解决方案
              </p>

              {/* 权益列表 */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 shadow-sm"
                    >
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-blue-100">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4" />
                <span>已有 <span className="font-bold">10,000+</span> 用户信赖选择</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 表单内容 */}
        <div className="flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md flex flex-col lg:h-[calc(100vh-8rem)]">
            {/* 移动端顶部 */}
            <div className="lg:hidden mb-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
                  <span className="text-lg font-bold text-white">P</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PixelDraw
                </span>
              </Link>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">欢迎来到 PixelDraw</h2>
                <p className="text-muted-foreground">注册即送 20 积分</p>
              </div>
            </div>

            {/* Clerk 组件内容 */}
            <div className="flex-1 flex flex-col min-h-0">
              {children}
            </div>

            {/* 移动端返回链接 */}
            <div className="lg:hidden mt-6 text-center flex-shrink-0">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← 返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
