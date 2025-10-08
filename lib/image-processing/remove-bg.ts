// Remove.bg API 配置
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export interface RemoveBgOptions {
  size?: 'preview' | 'full' | 'auto';
  type?: 'auto' | 'person' | 'product' | 'car';
  format?: 'auto' | 'png' | 'jpg' | 'zip';
  roi?: string; // Region of interest: "0% 0% 100% 100%"
  crop?: boolean;
  scale?: string; // "original" | "50%" | "25%"
  position?: string; // "original" | "center"
  channels?: 'rgba' | 'alpha';
  shadow?: boolean;
  semitransparency?: boolean;
  bg_color?: string; // Hex color like "#ffffff"
  bg_image_url?: string;
}

export interface RemoveBgResult {
  data: Buffer;
  detectedType: string;
  width: number;
  height: number;
  creditsCharged: number;
}

/**
 * Remove.bg 抠图服务类
 */
export class RemoveBgService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REMOVE_BG_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Remove.bg API key is required');
    }
  }

  /**
   * 移除图片背景
   */
  async removeBackground(
    imageBuffer: Buffer,
    options: RemoveBgOptions = {}
  ): Promise<RemoveBgResult> {
    // 使用 base64 编码图片
    const base64Image = imageBuffer.toString('base64');

    // 构建请求体（使用 JSON 格式）
    const requestBody: Record<string, any> = {
      image_file_b64: base64Image,
    };

    // 添加可选参数
    if (options.size) requestBody.size = options.size;
    if (options.type) requestBody.type = options.type;
    if (options.format) requestBody.format = options.format;
    if (options.roi) requestBody.roi = options.roi;
    if (options.crop !== undefined) requestBody.crop = options.crop;
    if (options.scale) requestBody.scale = options.scale;
    if (options.position) requestBody.position = options.position;
    if (options.channels) requestBody.channels = options.channels;
    if (options.shadow !== undefined) requestBody.add_shadow = options.shadow;
    if (options.semitransparency !== undefined) requestBody.semitransparency = options.semitransparency;
    if (options.bg_color) requestBody.bg_color = options.bg_color;
    if (options.bg_image_url) requestBody.bg_image_url = options.bg_image_url;

    try {
      console.log('[Remove.bg] 发送请求到 API...', {
        url: REMOVE_BG_API_URL,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
        imageSize: imageBuffer.length,
        base64Length: base64Image.length,
        options: {
          ...requestBody,
          image_file_b64: `[base64 data: ${base64Image.length} chars]`
        }
      });

      const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[Remove.bg] API 响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Remove.bg] API 错误响应:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(
          errorData.errors?.[0]?.title ||
          errorData.message ||
          `Remove.bg API error: ${response.status} ${response.statusText}`
        );
      }

      // 获取结果图片
      const arrayBuffer = await response.arrayBuffer();
      const resultBuffer = Buffer.from(arrayBuffer);

      // 解析响应头中的元数据
      const detectedType = response.headers.get('X-Detected-Type') || 'unknown';
      const width = parseInt(response.headers.get('X-Width') || '0');
      const height = parseInt(response.headers.get('X-Height') || '0');
      const creditsCharged = parseFloat(response.headers.get('X-Credits-Charged') || '0');

      return {
        data: resultBuffer,
        detectedType,
        width,
        height,
        creditsCharged,
      };
    } catch (error) {
      console.error('Remove.bg API error:', error);
      throw error;
    }
  }

  /**
   * 获取账户信息
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await fetch('https://api.remove.bg/v1.0/account', {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get account info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get Remove.bg account info:', error);
      throw error;
    }
  }
}
