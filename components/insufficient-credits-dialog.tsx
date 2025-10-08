'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { TASK_CREDIT_COST } from '@/lib/quota';
import { TaskType } from '@/types/database';

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: TaskType;
  currentCredits: number;
}

const TASK_NAMES: Record<TaskType, string> = {
  compress: '图片压缩',
  remove_bg: 'AI 智能抠图',
  recognize: '图像识别',
  generate: 'AI 图像生成',
};

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  taskType,
  currentCredits,
}: InsufficientCreditsDialogProps) {
  const required = TASK_CREDIT_COST[taskType];
  const shortage = required - currentCredits;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-xl">积分不足</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 积分情况 */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">当前积分</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {currentCredits}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">所需积分</p>
                <p className="text-lg font-bold text-orange-600">{required}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">还差</p>
                <p className="text-lg font-bold text-red-600">{shortage}</p>
              </div>
            </div>
          </div>

          {/* 说明文本 */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            使用 <span className="font-semibold">{TASK_NAMES[taskType]}</span> 功能需要{' '}
            <span className="font-semibold text-orange-600">{required} 积分</span>
            ，您当前还差 <span className="font-semibold text-red-600">{shortage} 积分</span>。
          </p>

          {/* 推荐套餐 */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  推荐方案
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  购买入门套餐（100 积分）仅需 $4.99
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/credits">
                <Zap className="h-4 w-4 mr-2" />
                立即购买积分
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              稍后再说
            </Button>
          </div>

          {/* 提示信息 */}
          <p className="text-xs text-center text-gray-500">
            积分永久有效，不会过期
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
