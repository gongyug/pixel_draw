import { z } from 'zod';

// 环境变量验证 schema
const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Clerk (认证服务)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),

  // 火山引擎 AI 服务
  ARK_API_KEY: z.string().min(1).optional(),

  // Remove.bg
  REMOVE_BG_API_KEY: z.string().min(1).optional(),

  // 应用配置
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// 验证环境变量
export const env = envSchema.parse(process.env);

// 类型导出
export type Env = z.infer<typeof envSchema>;
