import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseService } from '@/lib/supabase/service';

export const runtime = 'nodejs';

// 新用户初始积分
const INITIAL_CREDITS = 20;

export async function POST(req: Request) {
  // 获取 webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('请在环境变量中配置 CLERK_WEBHOOK_SECRET');
  }

  // 获取 headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // 验证必要的 headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('缺少 svix headers', {
      status: 400,
    });
  }

  // 获取 body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 创建 webhook 实例
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 验证 webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook 验证失败:', err);
    return new Response('Webhook 验证失败', {
      status: 400,
    });
  }

  // 处理事件
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`收到 Clerk Webhook: ${eventType}`, { id });

  // 处理用户创建事件
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    if (!primaryEmail) {
      console.error('用户没有主邮箱:', id);
      return new Response('用户没有主邮箱', { status: 400 });
    }

    try {
      // 同步用户到 Supabase
      const { data, error } = await supabaseService
        .from('users')
        .upsert({
          id: id,
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          avatar_url: image_url || null,
          plan_type: 'free',
          credits_remaining: INITIAL_CREDITS,
        } as any, {
          onConflict: 'id',
        })
        .select()
        .single();

      if (error) {
        console.error('同步用户到 Supabase 失败:', error);
        return new Response('同步用户失败', { status: 500 });
      }

      console.log('用户同步成功，赋予初始积分:', data);

      // 记录积分变动
      await supabaseService.from('credit_transactions').insert({
        user_id: id,
        amount: INITIAL_CREDITS,
        type: 'initial_grant',
        description: '新用户注册奖励',
      } as any);

    } catch (error) {
      console.error('处理用户创建事件失败:', error);
      return new Response('处理失败', { status: 500 });
    }
  }

  // 处理用户更新事件
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    if (!primaryEmail) {
      console.error('用户没有主邮箱:', id);
      return new Response('用户没有主邮箱', { status: 400 });
    }

    try {
      // 更新用户信息
      await supabaseService
        .from('users')
        .update({
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          avatar_url: image_url || null,
        } as any)
        .eq('id', id);

      console.log('用户信息更新成功:', id);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return new Response('更新失败', { status: 500 });
    }
  }

  // 处理用户删除事件
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await supabaseService.from('users').delete().eq('id', id);
      console.log('用户删除成功:', id);
    } catch (error) {
      console.error('删除用户失败:', error);
      return new Response('删除失败', { status: 500 });
    }
  }

  return new Response('处理成功', { status: 200 });
}
