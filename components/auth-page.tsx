'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

export function AuthPage({ mode: initialMode }: AuthPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    // 同步 URL
    if (newMode === 'signin') {
      router.push('/sign-in');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="w-full lg:h-full flex flex-col min-h-[500px]">
      {/* 浏览器标签页样式的选项卡 */}
      <div className="flex gap-1 mb-0 bg-gray-100/50 dark:bg-gray-800/30 rounded-t-2xl flex-shrink-0">
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
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
          onClick={() => handleModeChange('signin')}
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
      <div className="bg-white dark:bg-gray-900 rounded-b-2xl pt-4 pb-6 px-6 flex-1 flex items-center justify-center overflow-y-auto min-h-[400px]">
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
  );
}
