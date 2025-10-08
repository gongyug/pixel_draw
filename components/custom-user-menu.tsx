'use client';

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Wallet,
  Plus,
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
import { useUserCredits } from '@/hooks/use-user-credits';

export function CustomUserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { credits, isLoading: creditsLoading } = useUserCredits();

  // 加载中显示骨架屏
  if (!isLoaded || !user) {
    return (
      <div className="relative h-8 w-8 rounded-full" suppressHydrationWarning>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.imageUrl}
              alt={user.fullName || '用户'}
              loading="eager"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
              {user.firstName?.charAt(0) || user.primaryEmailAddress?.emailAddress.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName || '用户'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 积分 */}
        <DropdownMenuItem asChild>
          <Link href="/credits" className="cursor-pointer">
            <Wallet className="mr-2 h-4 w-4 text-yellow-500" />
            <span>
              积分：{creditsLoading ? '...' : credits !== null ? credits : '...'}
            </span>
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
  );
}
