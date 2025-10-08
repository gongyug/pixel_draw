import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RemoveBgService } from '@/lib/image-processing/remove-bg';
import { taskManager } from '@/lib/task-manager';
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

export async function POST(request: NextRequest) {
      const { userId } = await auth();  if (!userId) {
    return new NextResponse(JSON.stringify({ error: '请先登录' }), { status: 401 });
  }

  let taskId: string | null = null;

  try {
    // 检查用户是否有足够积分
    if (!(await hasEnoughCredits(userId, 'remove_bg'))) {
      return NextResponse.json({ error: '积分不足，请充值' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const size = (formData.get('size') as 'preview' | 'full' | 'auto') || 'auto';
    const type = (formData.get('type') as 'auto' | 'person' | 'product' | 'car') || 'auto';
    const format = (formData.get('format') as 'auto' | 'png' | 'jpg') || 'png';
    const bgColor = formData.get('bg_color') as string | null;
    const bgImageUrl = formData.get('bg_image_url') as string | null;

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPG、PNG、WebP' },
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
    const cost = TASK_CREDIT_COST['remove_bg'];
    const deductionSuccessful = await deductCredits(userId, cost);
    if (!deductionSuccessful) {
      return NextResponse.json({ error: '积分扣除失败，请稍后再试' }, { status: 500 });
    }

    // Create task record
    taskId = await taskManager.createTask({
      userId,
      taskType: 'remove_bg',
      input: { filename: file.name, size: file.size, type: file.type },
    });

    if (!taskId) {
      throw new Error('无法创建任务记录');
    }

    await taskManager.updateTaskStatus(taskId, 'processing');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const removeBgService = new RemoveBgService();
    const result = await removeBgService.removeBackground(buffer, {
      size,
      type,
      format,
      bg_color: bgColor || undefined,
      bg_image_url: bgImageUrl || undefined,
    });

    // Update task to completed
    await taskManager.updateTaskStatus(taskId, 'completed', { ...result }, cost);

    const originalName = file.name.split('.')[0];
    const outputFileName = `${originalName}_no_bg.png`;

    return new NextResponse(result.data as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'X-Credits-Charged': cost.toString(),
        'X-Detected-Type': result.detectedType,
        'X-Width': result.width.toString(),
        'X-Height': result.height.toString()
      },
    });

  } catch (error) {
    console.error('抠图错误:', error);

    if (taskId) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      await taskManager.updateTaskStatus(taskId, 'failed', undefined, TASK_CREDIT_COST['remove_bg'], errorMessage); // Pass cost even on failure
    }

    // 处理 Remove.bg API 特定错误
    if (error instanceof Error) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json(
          { error: 'Remove.bg API 配额不足，请稍后再试' },
          { status: 429 }
        );
      }
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Remove.bg API key 无效' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: '抠图失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取抠图选项信息
export async function GET() {
  return NextResponse.json({
    sizes: [
      { id: 'preview', name: '预览', description: '最大 0.25 兆像素，快速预览' },
      { id: 'full', name: '全尺寸', description: '最大 25 兆像素，完整质量' },
      { id: 'auto', name: '自动', description: '根据图片自动选择', recommended: true },
    ],
    types: [
      { id: 'auto', name: '自动检测', description: '自动识别主体类型', recommended: true },
      { id: 'person', name: '人物', description: '优化人物抠图' },
      { id: 'product', name: '产品', description: '优化产品抠图' },
      { id: 'car', name: '汽车', description: '优化汽车抠图' },
    ],
    formats: [
      { id: 'png', name: 'PNG', description: '支持透明背景' },
      { id: 'jpg', name: 'JPG', description: '不支持透明，文件较小' },
    ],
    maxFileSize: '50MB',
  });
}
