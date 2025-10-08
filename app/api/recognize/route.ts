import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ArkClient } from '@/lib/ai/ark-client';
import { hasEnoughCredits, deductCredits, TASK_CREDIT_COST } from '@/lib/quota';

// 配置 API 路由以处理文件上传
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 配置最大文件大小 50MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

type RecognitionType = 'describe' | 'detect_objects' | 'extract_text' | 'analyze';

interface RecognitionRequest {
  type: RecognitionType;
  customPrompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查用户是否有足够积分
    if (!(await hasEnoughCredits(userId, 'recognize'))) {
      return NextResponse.json({ error: '积分不足，请充值' }, { status: 403 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as RecognitionType) || 'describe';
    const customPrompt = formData.get('custom_prompt') as string | null;

    // 验证文件
    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、WebP' },
        { status: 400 }
      );
    }

    // 验证文件大小 (10MB for recognition)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制（最大 10MB）' },
        { status: 400 }
      );
    }

    // 扣除积分
    const deductionSuccessful = await deductCredits(userId, TASK_CREDIT_COST.recognize);
    if (!deductionSuccessful) {
      return NextResponse.json({ error: '积分扣除失败，请稍后再试' }, { status: 500 });
    }

    // 将文件转换为 Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // 执行识别
    const arkClient = new ArkClient();
    let result: string;

    switch (type) {
      case 'describe':
        result = await arkClient.describeImage(base64Image);
        break;
      case 'detect_objects':
        result = await arkClient.detectObjects(base64Image);
        break;
      case 'extract_text':
        result = await arkClient.extractText(base64Image);
        break;
      case 'analyze':
        if (customPrompt) {
          result = await arkClient.analyzeImage(base64Image, customPrompt);
        } else {
          result = await arkClient.describeImage(base64Image);
        }
        break;
      default:
        result = await arkClient.describeImage(base64Image);
    }

    // 返回识别结果
    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('图像识别错误:', error);

    // 处理 ARK API 特定错误
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
    }

    return NextResponse.json(
      {
        error: '图像识别失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取识别选项信息
export async function GET() {
  return NextResponse.json({
    types: [
      {
        id: 'describe',
        name: '图像描述',
        description: '详细描述图片内容、场景、颜色和氛围',
        icon: 'image',
        recommended: true,
      },
      {
        id: 'detect_objects',
        name: '物体识别',
        description: '识别图片中的所有物体及其位置',
        icon: 'scan',
      },
      {
        id: 'extract_text',
        name: 'OCR 文字识别',
        description: '提取图片中的所有文字内容',
        icon: 'text',
      },
      {
        id: 'analyze',
        name: '自定义分析',
        description: '使用自定义提示词分析图片',
        icon: 'sparkles',
      },
    ],
    model: 'doubao-seed-1-6-flash-250828',
    maxFileSize: '10MB',
    supportedFormats: ['JPG', 'PNG', 'WebP'],
  });
}
