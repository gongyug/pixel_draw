import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseService } from '@/lib/supabase/service';
import { getPackageById, getTotalCredits } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

// 验证 webhook 签名
function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('缺少 LEMONSQUEEZY_WEBHOOK_SECRET');
    return false;
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    // 获取签名
    const signature = request.headers.get('x-signature');
    if (!signature) {
      return NextResponse.json({ error: '缺少签名' }, { status: 400 });
    }

    // 获取 payload
    const rawBody = await request.text();

    // 验证签名
    if (!verifySignature(rawBody, signature)) {
      console.error('Webhook 签名验证失败');
      return NextResponse.json({ error: '签名验证失败' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { meta, data } = payload;

    console.log('收到 Lemon Squeezy Webhook:', meta.event_name);

    // 处理订单创建事件
    if (meta.event_name === 'order_created') {
      const { attributes, id: orderId } = data;
      const { user_id, package_id } = attributes.custom_data || {};

      if (!user_id || !package_id) {
        console.error('缺少必要的自定义数据:', attributes.custom_data);
        return NextResponse.json({ error: '缺少必要的数据' }, { status: 400 });
      }

      const pkg = getPackageById(package_id);
      if (!pkg) {
        console.error('无效的套餐 ID:', package_id);
        return NextResponse.json({ error: '无效的套餐' }, { status: 400 });
      }

      const totalCredits = getTotalCredits(pkg);
      const orderStatus = attributes.status;

      // 只有支付成功的订单才增加积分
      if (orderStatus === 'paid') {
        try {
          // 使用数据库函数增加积分并记录交易
          const { error } = await supabaseService.rpc('add_user_credits', {
            p_user_id: user_id,
            p_amount: totalCredits,
            p_type: 'purchase',
            p_description: `购买 ${pkg.name}`,
            p_order_id: orderId.toString(),
          } as never);

          if (error) {
            console.error('增加积分失败:', error);
            return NextResponse.json({ error: '增加积分失败' }, { status: 500 });
          }

          console.log(
            `用户 ${user_id} 购买成功，增加 ${totalCredits} 积分，订单 ${orderId}`
          );

          // 可选：发送邮件通知用户
          // await sendPurchaseSuccessEmail(user_id, pkg, orderId);

        } catch (error) {
          console.error('处理支付失败:', error);
          return NextResponse.json({ error: '处理支付失败' }, { status: 500 });
        }
      } else {
        console.log(`订单 ${orderId} 状态为 ${orderStatus}，暂不处理`);
      }
    }

    // 处理订单退款事件
    if (meta.event_name === 'order_refunded') {
      const { attributes, id: orderId } = data;
      const { user_id } = attributes.custom_data || {};

      if (!user_id) {
        console.error('退款订单缺少用户 ID');
        return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 });
      }

      try {
        // 查询原始交易记录
        const { data: transaction, error: queryError } = await supabaseService
          .from('credit_transactions')
          .select('*')
          .eq('order_id', orderId.toString())
          .eq('type', 'purchase')
          .single();

        if (queryError || !transaction) {
          console.error('未找到原始交易记录:', orderId);
          return NextResponse.json({ error: '未找到交易记录' }, { status: 404 });
        }

        // 扣除退款的积分（如果用户有足够余额）
        const refundAmount = (transaction as any).amount;

        const { error: refundError } = await supabaseService.rpc('add_user_credits', {
          p_user_id: user_id,
          p_amount: -refundAmount, // 负数表示扣除
          p_type: 'refund',
          p_description: `订单 ${orderId} 退款`,
          p_order_id: orderId.toString(),
        } as never);

        if (refundError) {
          console.error('处理退款失败:', refundError);
          return NextResponse.json({ error: '处理退款失败' }, { status: 500 });
        }

        console.log(`用户 ${user_id} 退款成功，扣除 ${refundAmount} 积分`);

      } catch (error) {
        console.error('处理退款错误:', error);
        return NextResponse.json({ error: '处理退款失败' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook 处理错误:', error);
    return NextResponse.json(
      {
        error: 'Webhook 处理失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
