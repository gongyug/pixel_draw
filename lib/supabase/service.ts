import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase URL 和 Service Role Key 从环境变量读取
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for service client');
}

// 创建具有服务角色的 Supabase 客户端（用于需要管理员权限的操作）
export const supabaseService = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
