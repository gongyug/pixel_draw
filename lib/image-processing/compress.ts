import sharp from 'sharp';

// 压缩模式类型
export type CompressMode = 'smart' | 'extreme' | 'lossless' | 'custom';

// 压缩配置接口
export interface CompressOptions {
  mode: CompressMode;
  quality?: number; // 1-100, 仅用于 custom 模式
  format?: 'jpeg' | 'png' | 'webp' | 'avif'; // 输出格式
}

// 压缩结果接口
export interface CompressResult {
  data: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 压缩率百分比
  format: string;
}

/**
 * 图片压缩服务类
 */
export class ImageCompressor {
  /**
   * 压缩图片
   */
  async compress(
    imageBuffer: Buffer,
    options: CompressOptions
  ): Promise<CompressResult> {
    const originalSize = imageBuffer.length;

    // 获取图片元数据
    const metadata = await sharp(imageBuffer).metadata();
    const outputFormat = options.format || this.detectBestFormat(metadata.format);

    let compressedBuffer: Buffer;

    switch (options.mode) {
      case 'smart':
        compressedBuffer = await this.smartCompress(imageBuffer, outputFormat);
        break;
      case 'extreme':
        compressedBuffer = await this.extremeCompress(imageBuffer, outputFormat);
        break;
      case 'lossless':
        compressedBuffer = await this.losslessCompress(imageBuffer, outputFormat);
        break;
      case 'custom':
        compressedBuffer = await this.customCompress(
          imageBuffer,
          outputFormat,
          options.quality || 80
        );
        break;
      default:
        compressedBuffer = await this.smartCompress(imageBuffer, outputFormat);
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      data: compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      format: outputFormat,
    };
  }

  /**
   * 智能压缩 - 目标: 减少 60-80%，质量损失 < 5%
   */
  private async smartCompress(
    buffer: Buffer,
    format: string
  ): Promise<Buffer> {
    const image = sharp(buffer);

    switch (format) {
      case 'jpeg':
        return image
          .jpeg({
            quality: 82,
            progressive: true,
            mozjpeg: true, // 使用 mozjpeg 优化
          })
          .toBuffer();

      case 'png':
        return image
          .png({
            quality: 85,
            compressionLevel: 9,
            adaptiveFiltering: true,
          })
          .toBuffer();

      case 'webp':
        return image
          .webp({
            quality: 85,
            effort: 6,
          })
          .toBuffer();

      case 'avif':
        return image
          .avif({
            quality: 65,
            effort: 6,
          })
          .toBuffer();

      default:
        return image.toBuffer();
    }
  }

  /**
   * 极限压缩 - 目标: 减少 80-90%
   */
  private async extremeCompress(
    buffer: Buffer,
    format: string
  ): Promise<Buffer> {
    const image = sharp(buffer);

    switch (format) {
      case 'jpeg':
        return image
          .jpeg({
            quality: 60,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();

      case 'png':
        // PNG 转为 WebP 以获得更好的压缩
        return image
          .webp({
            quality: 65,
            effort: 6,
          })
          .toBuffer();

      case 'webp':
        return image
          .webp({
            quality: 65,
            effort: 6,
          })
          .toBuffer();

      case 'avif':
        return image
          .avif({
            quality: 50,
            effort: 6,
          })
          .toBuffer();

      default:
        return image.toBuffer();
    }
  }

  /**
   * 无损压缩 - 目标: 减少 10-30%，完全保留质量
   */
  private async losslessCompress(
    buffer: Buffer,
    format: string
  ): Promise<Buffer> {
    const image = sharp(buffer);

    switch (format) {
      case 'jpeg':
        // JPEG 没有真正的无损模式，使用最高质量
        return image
          .jpeg({
            quality: 100,
            progressive: true,
          })
          .toBuffer();

      case 'png':
        return image
          .png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true, // 尝试使用调色板减小文件
          })
          .toBuffer();

      case 'webp':
        return image
          .webp({
            lossless: true,
            effort: 6,
          })
          .toBuffer();

      case 'avif':
        return image
          .avif({
            lossless: true,
            effort: 9,
          })
          .toBuffer();

      default:
        return image.toBuffer();
    }
  }

  /**
   * 自定义压缩 - 用户指定质量
   */
  private async customCompress(
    buffer: Buffer,
    format: string,
    quality: number
  ): Promise<Buffer> {
    const image = sharp(buffer);

    // 限制质量范围在 1-100
    const clampedQuality = Math.max(1, Math.min(100, quality));

    switch (format) {
      case 'jpeg':
        return image
          .jpeg({
            quality: clampedQuality,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();

      case 'png':
        return image
          .png({
            quality: clampedQuality,
            compressionLevel: 9,
          })
          .toBuffer();

      case 'webp':
        return image
          .webp({
            quality: clampedQuality,
            effort: 6,
          })
          .toBuffer();

      case 'avif':
        return image
          .avif({
            quality: clampedQuality,
            effort: 6,
          })
          .toBuffer();

      default:
        return image.toBuffer();
    }
  }

  /**
   * 检测最佳输出格式
   */
  private detectBestFormat(originalFormat?: string): string {
    // 默认使用 WebP，它有最好的压缩比和质量平衡
    if (!originalFormat) return 'webp';

    // 如果原格式是 GIF 或 SVG，保持原格式
    if (originalFormat === 'gif' || originalFormat === 'svg') {
      return originalFormat;
    }

    // 优先使用 WebP
    return 'webp';
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
