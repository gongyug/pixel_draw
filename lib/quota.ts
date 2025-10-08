import { supabaseService } from './supabase/service';
import { TaskType } from '@/types/database';
import { ensureUserExists } from './user';

// 定义不同任务消耗的积分
export const TASK_CREDIT_COST: Record<TaskType, number> = {
  'compress': 1,       // 压缩
  'remove_bg': 2,    // 抠图
  'recognize': 5,    // 识别
  'generate': 10,      // 生成
};

/**
 * 获取用户剩余积分
 * @param userId 用户 ID
 * @returns 剩余积分数
 */
export async function getUserCredits(userId: string): Promise<number> {
  // 确保用户存在
  await ensureUserExists(userId);

  const { data, error } = await supabaseService
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error(`获取用户 ${userId} 积分失败:`, error);
    return 0;
  }

  return data.credits_remaining || 0;
}

/**
 * 扣除用户积分
 * @param userId 用户 ID
 * @param amount 要扣除的积分数量
 * @returns 是否扣除成功
 */
export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  if (amount <= 0) return true;

  const { error } = await supabaseService.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    console.error(`扣除用户 ${userId} 积分失败:`, error);
    return false;
  }

  return true;
}

/**
 * 检查用户是否有足够积分执行任务
 * @param userId 用户 ID
 * @param taskType 任务类型
 * @returns 是否有足够积分
 */
export async function hasEnoughCredits(userId: string, taskType: TaskType): Promise<boolean> {
  const required = TASK_CREDIT_COST[taskType];
  if (required === 0) {
    return true;
  }

  const currentCredits = await getUserCredits(userId);
  return currentCredits >= required;
}
