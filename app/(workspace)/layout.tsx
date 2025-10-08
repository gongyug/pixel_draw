"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Scissors,
  Eye,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkspaceHeader } from "@/components/workspace-header";
import { CustomUserMenu } from "@/components/custom-user-menu";

const navigation = [
  { name: "仪表盘", href: "/dashboard", icon: LayoutDashboard, color: "text-gray-700 dark:text-gray-300", bgActive: "bg-gray-100 dark:bg-gray-800" },
  { name: "图片压缩", href: "/compress", icon: Zap, color: "text-blue-600", bgActive: "bg-blue-50 dark:bg-blue-950" },
  { name: "AI 智能抠图", href: "/remove-bg", icon: Scissors, color: "text-purple-600", bgActive: "bg-purple-50 dark:bg-purple-950" },
  { name: "图像识别", href: "/recognition", icon: Eye, color: "text-pink-600", bgActive: "bg-pink-50 dark:bg-pink-950" },
  { name: "AI 图像生成", href: "/generate", icon: Sparkles, color: "text-indigo-600", bgActive: "bg-indigo-50 dark:bg-indigo-950" },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white transition-transform duration-300 dark:bg-gray-950 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PixelDraw
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={cn('h-4 w-4', isActive && item.color)} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-4">
            <CustomUserMenu />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* ... (Main content and decorative elements remain the same) ... */}
        <div className="relative py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
