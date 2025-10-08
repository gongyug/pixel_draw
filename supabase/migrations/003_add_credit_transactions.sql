-- 积分交易记录表
-- 用于记录所有积分变动历史

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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

-- 行级安全策略
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 创建积分增加函数（充值）
CREATE OR REPLACE FUNCTION add_user_credits(p_user_id UUID, p_amount INTEGER, p_type VARCHAR, p_description TEXT, p_order_id TEXT DEFAULT NULL)
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

-- 修改扣除积分函数，同时记录交易
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INTEGER)
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
