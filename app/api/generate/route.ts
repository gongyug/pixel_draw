import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SeedreamClient } from '@/lib/ai/seedream-client';
import { hasEnoughCredits, deductCredits, TASK_CREDIT_COST } from '@/lib/quota';

// 配置 API 路由
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 最长 60 秒

interface GenerateRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  optimize_prompt?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    };

    // 检查用户是否有足够积分
    if (!(await hasEnoughCredits(userId, 'generate'))) {
      return NextResponse.json({ error: '积分不足，请充值' }, { status: 403 });
    }

    const body = await request.json() as GenerateRequest;
    const {
      prompt,
      negative_prompt,
      width,
      height,
      seed,
      optimize_prompt = true,
    } = body;

    // 验证提示词
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入提示词' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: '提示词过长（最大 1000 字符）' },
        { status: 400 }
      );
    }

    // 验证尺寸
    const validSizes = [512, 768, 1024];
    const requestWidth = width || 1024;
    const requestHeight = height || 1024;

    if (!validSizes.includes(requestWidth) || !validSizes.includes(requestHeight)) {
      return NextResponse.json(
        { error: '不支持的图片尺寸，仅支持 512、768、1024' },
        { status: 400 }
      );
    }

    // 扣除积分
    const deductionSuccessful = await deductCredits(userId, TASK_CREDIT_COST.generate);
    if (!deductionSuccessful) {
      return NextResponse.json({ error: '积分扣除失败，请稍后再试' }, { status: 500 });
    }

    // 执行图像生成
    const seedreamClient = new SeedreamClient();

    // 优化提示词（如果需要）
    const finalPrompt = optimize_prompt
      ? seedreamClient.optimizePrompt(prompt)
      : prompt;

    // 生成随机种子（如果未提供）
    const finalSeed = seed || seedreamClient.generateRandomSeed();

    // 生成图像
    const base64Image = await seedreamClient.textToImage(finalPrompt, {
      negative_prompt,
      width: requestWidth,
      height: requestHeight,
      seed: finalSeed,
    });

    // 返回生成结果
    return NextResponse.json({
      success: true,
      image: base64Image,
      metadata: {
        prompt: finalPrompt,
        original_prompt: prompt,
        negative_prompt,
        width: requestWidth,
        height: requestHeight,
        seed: finalSeed,
        optimized: optimize_prompt,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('图像生成错误:', error);

    // 处理 Seedream API 特定错误
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: '火山引擎 API key 无效或未配置' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API 配额不足或请求过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
      if (error.message.includes('NSFW') || error.message.includes('content policy')) {
        return NextResponse.json(
          { error: '提示词包含不当内容，请修改后重试' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: '图像生成失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取生成选项信息
export async function GET() {
  return NextResponse.json({
    model: 'doubao-seedream-4-0-250828',
    sizes: [
      { value: 512, label: '512×512', description: '快速生成，适合预览' },
      { value: 768, label: '768×768', description: '中等质量，平衡速度' },
      { value: 1024, label: '1024×1024', description: '高质量，生成较慢', recommended: true },
    ],
    aspectRatios: [
      { label: '正方形', width: 1024, height: 1024, icon: 'square' },
      { label: '横向', width: 1024, height: 768, icon: 'landscape' },
      { label: '纵向', width: 768, height: 1024, icon: 'portrait' },
    ],
    tips: [
      '使用详细的描述会得到更好的结果',
      '可以指定艺术风格，如"油画风格"、"水彩画"等',
      '使用负面提示词排除不想要的元素',
      '相同的种子值会生成相似的图片',
    ],
  });
}
