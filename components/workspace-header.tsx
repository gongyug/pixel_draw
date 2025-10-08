'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Scissors,
  Eye,
  Sparkles,
  Menu,
  Home,
  Wallet,
  Plus,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CustomUserMenu } from '@/components/custom-user-menu';
import { useUserCredits } from '@/hooks/use-user-credits';

const navigation = [
  {
    name: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-gray-700 dark:text-gray-300',
    bgActive: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    name: '图片压缩',
    href: '/compress',
    icon: Zap,
    color: 'text-blue-600',
    bgActive: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    name: 'AI 智能抠图',
    href: '/remove-bg',
    icon: Scissors,
    color: 'text-purple-600',
    bgActive: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    name: '图像识别',
    href: '/recognition',
    icon: Eye,
    color: 'text-pink-600',
    bgActive: 'bg-pink-50 dark:bg-pink-950',
  },
  {
    name: 'AI 图像生成',
    href: '/generate',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgActive: 'bg-indigo-50 dark:bg-indigo-950',
  },
];

interface WorkspaceHeaderProps {
  onMobileMenuToggle: () => void;
}

export function WorkspaceHeader({ onMobileMenuToggle }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const { credits } = useUserCredits();

  return (
    <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <span className="hidden sm:inline-block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PixelDraw
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 ml-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? `${item.bgActive} ${item.color}`
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && item.color)} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-4">
          {credits !== null && (
            <div className="flex items-center gap-2">
              <Link
                href="/credits"
                className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="查看积分余额"
              >
                <Wallet className="h-4 w-4 text-yellow-500" />
                <span>{credits} 积分</span>
              </Link>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild title="购买积分">
                  <Link href="/credits">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild title="积分历史">
                  <Link href="/credit-history">
                    <History className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              回到首页
            </Link>
          </Button>

          {/* Custom User Menu */}
          <CustomUserMenu />
        </div>
      </div>
    </header>
  );
}
