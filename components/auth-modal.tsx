'use client';

import { SignIn, SignUp, useAuth } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import {
  Sparkles,
  Zap,
  Shield,
  Gift,
  Crown,
  Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const { isSignedIn } = useAuth();

  // 当用户登录成功后，自动关闭模态框
  useEffect(() => {
    if (isSignedIn && isOpen) {
      // 延迟关闭，让用户看到登录成功的状态
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [isSignedIn, isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
        <VisuallyHidden>
          <DialogTitle>登录或注册 PixelDraw</DialogTitle>
        </VisuallyHidden>

        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-200/20 to-transparent rounded-full blur-3xl dark:from-pink-500/10" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl dark:from-blue-500/10" />
        </div>

        <div className="relative grid md:grid-cols-2 gap-0" style={{ height: '700px' }}>
          {/* 左侧 - 权益介绍 */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 text-white backdrop-blur-sm hidden md:block overflow-y-auto">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  PixelDraw AI
                </div>

                <h2 className="text-3xl font-bold mb-3">
                  欢迎来到 PixelDraw
                </h2>
                <p className="text-blue-100 mb-8">
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

              <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4" />
                  <span>已有 <span className="font-bold">10,000+</span> 用户信赖选择</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧 - 登录/注册表单 */}
          <div className="p-8 md:p-12 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-y-auto flex flex-col">
            <div className="mb-6 md:hidden">
              <h2 className="text-2xl font-bold mb-2">欢迎来到 PixelDraw</h2>
              <p className="text-muted-foreground">注册即送 20 积分</p>
            </div>

            {/* 浏览器标签页样式的选项卡 */}
            <div className="w-full flex-1 flex flex-col">
              <div className="flex gap-1 mb-0 bg-gray-100/50 dark:bg-gray-800/30 rounded-t-2xl">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`
                    relative flex-1 px-8 py-3.5 font-medium transition-all duration-300 ease-out rounded-tl-2xl
                    ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-gray-900 text-primary font-semibold'
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="relative z-10 transition-colors duration-200">
                    注册账号
                  </span>
                  {mode === 'signup' && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" style={{ height: '3px' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`
                    relative flex-1 px-8 py-3.5 font-medium transition-all duration-300 ease-out rounded-tr-2xl
                    ${
                      mode === 'signin'
                        ? 'bg-white dark:bg-gray-900 text-primary font-semibold'
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <span className="relative z-10 transition-colors duration-200">
                    登录
                  </span>
                  {mode === 'signin' && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" style={{ height: '3px' }} />
                  )}
                </button>
              </div>

              {/* 内容区域 */}
              <div className="bg-white dark:bg-gray-900 rounded-b-2xl pt-4 pb-6 px-6 flex-1 flex items-center justify-center overflow-y-auto">
                <div className="w-full">
                  {mode === 'signup' ? (
                    <SignUp
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'shadow-none border-0',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'border-input hover:bg-accent',
                          formButtonPrimary: 'bg-primary hover:bg-primary/90',
                          footerActionLink: 'text-primary hover:text-primary/80',
                        },
                      }}
                      routing="virtual"
                      signInUrl="#"
                    />
                  ) : (
                    <SignIn
                      appearance={{
                        elements: {
                          rootBox: 'w-full',
                          card: 'shadow-none border-0',
                          headerTitle: 'hidden',
                          headerSubtitle: 'hidden',
                          socialButtonsBlockButton: 'border-input hover:bg-accent',
                          formButtonPrimary: 'bg-primary hover:bg-primary/90',
                          footerActionLink: 'text-primary hover:text-primary/80',
                        },
                      }}
                      routing="virtual"
                      signUpUrl="#"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
