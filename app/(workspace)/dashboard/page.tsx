"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Image,
  Wand2,
  Sparkles,
  ScanSearch,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useUserTasks } from "@/hooks/use-user-tasks";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { tasks, isLoading: tasksLoading } = useUserTasks();

  // 从任务列表计算统计数据
  const stats = {
    compress: tasks.filter(t => t.type === 'compress').length,
    removeBg: tasks.filter(t => t.type === 'remove-bg').length,
    recognize: tasks.filter(t => t.type === 'recognize').length,
    generate: tasks.filter(t => t.type === 'generate').length,
    total: tasks.length,
  };

  const features = [
    {
      title: "图片压缩",
      description: "智能压缩，保持画质",
      icon: Image,
      href: "/compress",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "AI 抠图",
      description: "自动移除背景",
      icon: Wand2,
      href: "/remove-bg",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "图像识别",
      description: "AI 理解图片内容",
      icon: ScanSearch,
      href: "/recognition",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "AI 生图",
      description: "文字生成图像",
      icon: Sparkles,
      href: "/generate",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  const taskTypeNames = {
    compress: '图片压缩',
    'remove-bg': 'AI 抠图',
    recognize: '图像识别',
    generate: 'AI 生图',
  };

  const taskTypeIcons = {
    compress: Image,
    'remove-bg': Wand2,
    recognize: ScanSearch,
    generate: Sparkles,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isLoaded && user ? `欢迎回来，${user.firstName || user.username || '用户'}！` : '仪表盘'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          查看您的使用统计和历史记录
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                总处理次数
              </h3>
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            累计使用所有功能的次数
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                图片压缩
              </h3>
              <p className="mt-2 text-3xl font-bold">{stats.compress}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            已优化 {stats.compress} 张图片
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                AI 抠图
              </h3>
              <p className="mt-2 text-3xl font-bold">{stats.removeBg}</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-950">
              <Wand2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            已处理 {stats.removeBg} 张图片
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                AI 功能
              </h3>
              <p className="mt-2 text-3xl font-bold">{stats.recognize + stats.generate}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-950">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            识别 {stats.recognize} 次 · 生成 {stats.generate} 次
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">快速开始</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className={`p-4 transition-all hover:shadow-md ${feature.bgColor} border-0`}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-background p-2 shadow-sm">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Usage Tips */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">使用提示</h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">💡 提示 1</p>
              <p className="mt-1 text-xs text-muted-foreground">
                使用智能压缩模式可以在保持画质的同时减少 60-80% 的文件大小
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">💡 提示 2</p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI 生图时，详细的提示词描述会获得更好的效果
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">💡 提示 3</p>
              <p className="mt-1 text-xs text-muted-foreground">
                抠图功能支持背景替换，可以自定义纯色或图片背景
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">最近活动</h2>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        {tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4">加载中...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 10).map((task) => {
              const Icon = taskTypeIcons[task.type];
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      {Icon ? <Icon className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {taskTypeNames[task.type]}
                        {task.creditsUsed > 0 && (
                          <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">-{task.creditsUsed} 积分</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.timestamp).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    {task.status === 'success' ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        成功
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                        失败
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
            <Clock className="mb-2 h-12 w-12 opacity-20" />
            <p>暂无活动记录</p>
            <p className="mt-1 text-xs">开始使用功能后，历史记录将显示在这里</p>
          </div>
        )}
      </Card>
    </div>
  );
}
