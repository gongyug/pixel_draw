-- PixelDraw 数据库 Schema (修正版)
-- 使用 Clerk User ID (TEXT) 而非 UUID

-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk User ID
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  credits_remaining INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_type ON users(plan_type);

-- ========================================
-- 任务记录表
-- ========================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Clerk User ID
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('compress', 'remove_bg', 'recognize', 'generate')),
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  input_file_url TEXT,
  output_file_url TEXT,
  parameters JSONB,
  result JSONB,
  credits_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_task_type ON tasks(task_type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- ========================================
-- 文件表
-- ========================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  original_name VARCHAR(255),
  file_size BIGINT,
  file_type VARCHAR(50),
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_files_created_at ON files(created_at DESC);

-- ========================================
-- 积分交易记录表
-- ========================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- 正数为充值/赠送，负数为消费
  type VARCHAR(50) NOT NULL CHECK (type IN ('initial_grant', 'purchase', 'task_consumption', 'refund', 'admin_adjustment')),
  description TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- 关联的任务（如果是任务消费）
  order_id TEXT, -- 关联的订单ID（如果是购买）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- ========================================
-- API 使用记录表
-- ========================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100),
  response_time INTEGER, -- 响应时间 (ms)
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_api_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_logs_created_at ON api_usage_logs(created_at DESC);

-- ========================================
-- 更新时间触发器 (用于 users 表)
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 数据库函数
-- ========================================

-- 扣除用户积分
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  -- 检查余额
  IF (SELECT credits_remaining FROM users WHERE id = p_user_id) < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits for user %', p_user_id;
  END IF;

  -- 扣除积分
  UPDATE users
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = p_user_id;

  -- 记录交易（负数表示消费）
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'task_consumption', '任务消费');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加用户积分
CREATE OR REPLACE FUNCTION add_user_credits(p_user_id TEXT, p_amount INTEGER, p_type VARCHAR, p_description TEXT, p_order_id TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- 增加积分
  UPDATE users
  SET credits_remaining = credits_remaining + p_amount
  WHERE id = p_user_id;

  -- 记录交易
  INSERT INTO credit_transactions (user_id, amount, type, description, order_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 服务角色权限
-- ========================================
-- 因为使用 service role key，不需要配置 RLS
-- service role 绕过所有 RLS 策略
