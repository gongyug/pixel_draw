'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { CustomUserMenu } from '@/components/custom-user-menu';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PixelDraw
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">登录</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">立即注册</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <CustomUserMenu />
          </SignedIn>
        </div>
      </div>
    </header>
  );