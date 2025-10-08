'use client';

import Link from 'next/link';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import {
  Wallet,
  Plus,
  Settings,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

const CREDITS_CACHE_KEY = 'user_credits_cache';
const USER_INFO_CACHE_KEY = 'user_info_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

interface CachedUserInfo {
  imageUrl: string;
  fullName: string | null;
  email: string;
  firstName: string | null;
}

// 同步读取缓存（仅客户端）
function getCachedUserInfo(): CachedUserInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(USER_INFO_CACHE_KEY);
    if (cached) {
      const { value, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      if (!isExpired) return value;
    }
  } catch (error) {
    console.error('Error reading user cache:', error);
  }
  return null;
}

function getCachedCredits(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CREDITS_CACHE_KEY);
    if (cached) {
      const { value, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      if (!isExpired) return value;
    }
  } catch (error) {
    console.error('Error reading credits cache:', error);
  }
  return null;
}

export function CustomUserMenu() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  // 直接读取缓存，不使用 state（客户端立即可用）
  const cachedUserData = typeof window !== 'undefined' ? getCachedUserInfo() : null;
  const cachedCreditsData = typeof window !== 'undefined' ? getCachedCredits() : null;

  const [credits, setCredits] = useState<number | null>(null);

  // 初始化 credits
  useEffect(() => {
    if (cachedCreditsData !== null) {
      setCredits(cachedCreditsData);
    }
  }, []);

  // 当 user 加载完成后，更新缓存
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const userInfo: CachedUserInfo = {
        imageUrl: user.imageUrl,
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName,
      };

      try {
        localStorage.setItem(USER_INFO_CACHE_KEY, JSON.stringify({
          value: userInfo,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error caching user info:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await apiGet('/api/user-credits');
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);

          // 缓存到 localStorage
          try {
            localStorage.setItem(CREDITS_CACHE_KEY, JSON.stringify({
              value: data.credits,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error('Error caching credits:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };
    if (isLoaded && isSignedIn) {
      fetchCredits();
    } else if (isLoaded && !isSignedIn) {
      setCredits(0);
    }
  }, [isLoaded, isSignedIn]);

  // 乐观更新：优先使用实际用户数据，否则使用缓存
  const displayUser = user || cachedUserData;
  const displayCredits = credits !== null ? credits : cachedCreditsData;

  // 先显示缓存，后台更新 - 只要有用户数据就立即显示
  if (displayUser) {
    return (
      <div suppressHydrationWarning>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={displayUser!.imageUrl}
                  alt={displayUser!.fullName || '用户'}
                  loading="eager"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {displayUser!.firstName?.charAt(0) || (('email' in displayUser!) ? displayUser!.email?.charAt(0).toUpperCase() : 'U') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayUser!.fullName || '用户'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {('email' in displayUser!) ? displayUser!.email : user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* 积分 - 使用缓存或实时数据 */}
            <DropdownMenuItem asChild>
              <Link href="/credits" className="cursor-pointer">
                <Wallet className="mr-2 h-4 w-4 text-yellow-500" />
                <span>积分：{displayCredits !== null ? displayCredits : '...'}</span>
              </Link>
            </DropdownMenuItem>

            {/* 充值 */}
            <DropdownMenuItem asChild>
              <Link href="/credits" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                <span>充值</span>
              </Link>
            </DropdownMenuItem>

            {/* 用户管理 */}
            <DropdownMenuItem asChild>
              <Link href="/user-profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>用户管理</span>
              </Link>
            </DropdownMenuItem>

            {/* 工作台 */}
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>工作台</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 登出 */}
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>登出</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // 只有在 Clerk 确认未登录且无缓存时才返回 null
  if (isLoaded && !isSignedIn) {
    return null;
  }

  // 正在加载中，显示骨架屏
  return (
    <div className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
    </div>
  );
}
