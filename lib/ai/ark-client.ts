// 火山引擎 ARK API 客户端

export interface ArkMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ArkMessageContent[];
}

export interface ArkMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface ArkChatCompletionRequest {
  model: string;
  messages: ArkMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ArkChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 火山引擎 ARK API 客户端
 */
export class ArkClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ARK_API_KEY || '';
    this.baseUrl = 'https://ark.cn-beijing.volces.com/api/v3';

    if (!this.apiKey) {
      throw new Error('ARK API key is required');
    }
  }

  /**
   * 调用聊天完成接口
   */
  async chatCompletion(
    request: ArkChatCompletionRequest
  ): Promise<ArkChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
          `ARK API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('ARK API error:', error);
      throw error;
    }
  }

  /**
   * 图像理解 - 通用分析
   */
  async analyzeImage(
    imageBase64: string,
    prompt: string = '请详细描述这张图片的内容。',
    model: string = 'doubao-seed-1-6-flash-250828'
  ): Promise<string> {
    const response = await this.chatCompletion({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * 物体识别
   */
  async detectObjects(imageBase64: string): Promise<string> {
    return this.analyzeImage(
      imageBase64,
      '请识别图片中的所有物体，并列出它们的名称、位置和特征。以结构化的方式回答。'
    );
  }

  /**
   * OCR 文字识别
   */
  async extractText(imageBase64: string): Promise<string> {
    return this.analyzeImage(
      imageBase64,
      '请识别并提取图片中的所有文字内容。保持原有的格式和布局，准确转录所有可见文字。'
    );
  }

  /**
   * 图像描述
   */
  async describeImage(imageBase64: string): Promise<string> {
    return this.analyzeImage(
      imageBase64,
      '请详细描述这张图片，包括：1) 主要内容和主体 2) 场景和环境 3) 颜色和光线 4) 整体氛围和风格。'
    );
  }

  /**
   * 图像分类
   */
  async classifyImage(imageBase64: string, categories: string[]): Promise<string> {
    const categoriesText = categories.join('、');
    return this.analyzeImage(
      imageBase64,
      `请将这张图片分类到以下类别之一：${categoriesText}。只返回最匹配的类别名称和置信度。`
    );
  }
}
