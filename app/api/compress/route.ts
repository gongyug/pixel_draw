import { NextRequest, NextResponse } from 'next/server';
import { ImageCompressor, CompressMode } from '@/lib/image-processing/compress';
import { auth } from '@clerk/nextjs/server';
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

interface CompressRequest {
  mode: CompressMode;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查用户是否有足够积分
    if (!(await hasEnoughCredits(userId, 'compress'))) {
      return NextResponse.json({ error: '积分不足，请充值' }, { status: 403 });
    }

    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = (formData.get('mode') as CompressMode) || 'smart';
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string) : undefined;
    const format = formData.get('format') as 'jpeg' | 'png' | 'webp' | 'avif' | undefined;

    // 验证文件
    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      );
    }

    // 验证文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过限制（最大 50MB）' },
        { status: 400 }
      );
    }

    // 扣除积分
    const deductionSuccessful = await deductCredits(userId, TASK_CREDIT_COST.compress);
    if (!deductionSuccessful) {
      return NextResponse.json({ error: '积分扣除失败，请稍后再试' }, { status: 500 });
    }

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 执行压缩
    const compressor = new ImageCompressor();
    const result = await compressor.compress(buffer, {
      mode,
      quality,
      format,
    });

    // 确定输出的 MIME 类型
    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      gif: 'image/gif',
    };

    const outputMimeType = mimeTypes[result.format] || 'image/jpeg';

    // 创建文件名
    const originalName = file.name.split('.')[0];
    const outputFileName = `${originalName}_compressed.${result.format}`;

    // 返回压缩后的图片和元数据
    return new NextResponse(result.data as any, {
      status: 200,
      headers: {
        'Content-Type': outputMimeType,
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'X-Original-Size': result.originalSize.toString(),
        'X-Compressed-Size': result.compressedSize.toString(),
        'X-Compression-Ratio': result.compressionRatio.toString(),
        'X-Output-Format': result.format,
      },
    });

  } catch (error) {
    console.error('图片压缩错误:', error);
    return NextResponse.json(
      {
        error: '图片压缩失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取压缩模式信息
export async function GET() {
  return NextResponse.json({
    modes: [
      {
        id: 'smart',
        name: '智能压缩',
        description: '平衡质量和文件大小，减少 60-80%',
        recommended: true,
      },
      {
        id: 'extreme',
        name: '极限压缩',
        description: '最大化压缩，减少 80-90%',
        recommended: false,
      },
      {
        id: 'lossless',
        name: '无损压缩',
        description: '保持完整质量，减少 10-30%',
        recommended: false,
      },
      {
        id: 'custom',
        name: '自定义压缩',
        description: '手动调节压缩质量（1-100）',
        recommended: false,
      },
    ],
    formats: ['jpeg', 'png', 'webp', 'avif'],
    maxFileSize: '50MB',
  });
}
