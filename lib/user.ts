import { supabaseService } from './supabase/service';
import { clerkClient } from '@clerk/nextjs/server';

const INITIAL_CREDITS = 20;

/**
 * 确保用户在数据库中存在
 * 如果不存在，从 Clerk 同步创建
 */
export async function ensureUserExists(userId: string): Promise<boolean> {
  try {
    // 检查用户是否存在
    const { data: existingUser } = await supabaseService
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      return true;
    }

    // 用户不存在，从 Clerk 获取信息并创建
    console.log('用户不存在于数据库，从 Clerk 同步:', userId);

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error('无法从 Clerk 获取用户信息:', userId);
      return false;
    }

    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    );

    if (!primaryEmail) {
      console.error('用户没有主邮箱:', userId);
      return false;
    }

    // 创建用户
    const { error } = await supabaseService.from('users').insert({
      id: userId,
      email: primaryEmail.emailAddress,
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || null,
      avatar_url: clerkUser.imageUrl || null,
      plan_type: 'free',
      credits_remaining: INITIAL_CREDITS,
    } as any);

    if (error) {
      console.error('创建用户失败:', error);
      return false;
    }

    // 记录初始积分
    await supabaseService.from('credit_transactions').insert({
      user_id: userId,
      amount: INITIAL_CREDITS,
      type: 'initial_grant',
      description: '新用户注册奖励',
    } as any);

    console.log('用户同步成功:', userId);
    return true;
  } catch (error) {
    console.error('ensureUserExists 失败:', error);
    return false;
  }
}
