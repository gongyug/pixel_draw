// 火山引擎 Seedream 图像生成服务

export interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_images?: number;
  seed?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface ImageGenerationResponse {
  id: string;
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}

/**
 * 火山引擎 Seedream 图像生成客户端
 */
export class SeedreamClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey?: string, model: string = 'doubao-seedream-4-0-250828') {
    this.apiKey = apiKey || process.env.ARK_API_KEY || '';
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
    this.model = model;

    if (!this.apiKey) {
      throw new Error('ARK API key is required');
    }
  }

  /**
   * 生成图像
   */
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    try {
      const requestBody = {
        model: this.model,
        prompt: request.prompt,
        negative_prompt: request.negative_prompt,
        size: `${request.width || 1024}x${request.height || 1024}`,
        n: request.num_images || 1,
        seed: request.seed,
        response_format: 'b64_json', // 返回 base64 编码的图片
      };

      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
          `Seedream API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Seedream API error:', error);
      throw error;
    }
  }

  /**
   * 文生图 - 快速生成
   */
  async textToImage(
    prompt: string,
    options?: {
      negative_prompt?: string;
      width?: number;
      height?: number;
      seed?: number;
    }
  ): Promise<string> {
    const response = await this.generateImage({
      prompt,
      negative_prompt: options?.negative_prompt,
      width: options?.width || 1024,
      height: options?.height || 1024,
      num_images: 1,
      seed: options?.seed,
    });

    // 返回 base64 图片
    return response.data[0]?.b64_json || '';
  }

  /**
   * 优化提示词
   */
  optimizePrompt(userPrompt: string): string {
    // 添加质量和风格关键词
    const qualityKeywords = [
      'high quality',
      'detailed',
      '8k',
      'professional',
    ];

    // 如果用户输入包含中文，添加中文提示词优化
    const hasChinese = /[\u4e00-\u9fa5]/.test(userPrompt);

    if (hasChinese) {
      // 保持原有中文提示词，但添加质量描述
      return `${userPrompt}, 高质量, 精细, 专业摄影`;
    }

    // 英文提示词优化
    return `${userPrompt}, ${qualityKeywords.join(', ')}`;
  }

  /**
   * 生成随机种子
   */
  generateRandomSeed(): number {
    return Math.floor(Math.random() * 2147483647);
  }
}
