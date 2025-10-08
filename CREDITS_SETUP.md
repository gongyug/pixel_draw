# 积分系统配置指南

本文档介绍如何配置 PixelDraw 的积分系统和支付功能。

## 📋 目录

1. [环境变量配置](#环境变量配置)
2. [Clerk 配置](#clerk-配置)
3. [Lemon Squeezy 配置](#lemon-squeezy-配置)
4. [数据库迁移](#数据库迁移)
5. [测试支付流程](#测试支付流程)

---

## 环境变量配置

### 必需的环境变量

在 `.env.local` 文件中添加以下配置：

```bash
# Clerk 认证和 Webhook
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Lemon Squeezy 支付
LEMONSQUEEZY_API_KEY=xxx
LEMONSQUEEZY_STORE_ID=xxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## Clerk 配置

### 1. 创建 Clerk 应用

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 创建新应用或选择现有应用
3. 获取 API Keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 2. 配置 Clerk Webhook

用于在用户注册时自动同步到 Supabase 并赋予初始积分。

1. 在 Clerk Dashboard 中，导航到 **Webhooks**
2. 点击 **Add Endpoint**
3. 填写配置：
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events to listen**:
     - `user.created` ✅
     - `user.updated` ✅
     - `user.deleted` ✅

4. 获取 **Signing Secret** 并设置为 `CLERK_WEBHOOK_SECRET`

### 3. 测试 Webhook

```bash
# 使用 Clerk 提供的测试功能发送测试 webhook
# 或者注册一个新用户测试
```

---

## Lemon Squeezy 配置

### 1. 创建 Lemon Squeezy 账户

1. 访问 [Lemon Squeezy](https://www.lemonsqueezy.com/)
2. 注册并创建商店
3. 获取 **Store ID** 和 **API Key**:
   - Dashboard → Settings → API
   - `LEMONSQUEEZY_API_KEY`
   - `LEMONSQUEEZY_STORE_ID`

### 2. 创建产品和变体

在 Lemon Squeezy Dashboard 中创建 4 个产品（对应 4 个积分套餐）：

#### 入门套餐 (Starter)
- **Product Name**: PixelDraw 积分 - 入门套餐
- **Price**: $4.99 USD
- **Description**: 100 积分，适合个人用户偶尔使用
- 创建后获取 **Variant ID**

#### 基础套餐 (Basic) - 推荐
- **Product Name**: PixelDraw 积分 - 基础套餐
- **Price**: $9.99 USD
- **Description**: 330 积分（300+30 赠送），最受欢迎的选择
- 创建后获取 **Variant ID**

#### 专业套餐 (Pro)
- **Product Name**: PixelDraw 积分 - 专业套餐
- **Price**: $29.99 USD
- **Description**: 1200 积分（1000+200 赠送），适合专业设计师
- 创建后获取 **Variant ID**

#### 企业套餐 (Enterprise)
- **Product Name**: PixelDraw 积分 - 企业套餐
- **Price**: $99.99 USD
- **Description**: 6500 积分（5000+1500 赠送），适合团队和企业
- 创建后获取 **Variant ID**

### 3. 更新代码中的 Variant IDs

编辑 `app/(workspace)/credits/page.tsx` 文件，更新 `getVariantId` 函数：

```typescript
const getVariantId = (packageId: string): string => {
  const variantMap: Record<string, string> = {
    starter: '你的入门套餐变体ID',      // 替换为实际的 variant ID
    basic: '你的基础套餐变体ID',        // 替换为实际的 variant ID
    pro: '你的专业套餐变体ID',          // 替换为实际的 variant ID
    enterprise: '你的企业套餐变体ID',   // 替换为实际的 variant ID
  };
  return variantMap[packageId] || '';
};
```

### 4. 配置 Lemon Squeezy Webhook

用于在支付成功后自动充值积分。

1. 在 Lemon Squeezy Dashboard 中，导航到 **Settings → Webhooks**
2. 点击 **Create Webhook**
3. 填写配置：
   - **Callback URL**: `https://your-domain.com/api/webhooks/lemonsqueezy`
   - **Events**:
     - `order_created` ✅
     - `order_refunded` ✅
   - **Secret**: 自动生成，复制后设置为 `LEMONSQUEEZY_WEBHOOK_SECRET`

### 5. 测试模式

Lemon Squeezy 提供测试模式，可以使用测试卡进行支付测试：

- 测试卡号: `4242 4242 4242 4242`
- 过期日期: 任意未来日期
- CVV: 任意 3 位数字

---

## 数据库迁移

### 1. 执行积分相关的数据库迁移

在 Supabase SQL Editor 中按顺序执行以下迁移文件：

#### 001_initial_schema.sql
已包含 `users` 表和 `credits_remaining` 字段

#### 002_add_deduct_credits_function.sql
添加扣除积分的数据库函数

#### 003_add_credit_transactions.sql (新增)
添加积分交易记录表和相关函数

```bash
# 在 Supabase Dashboard 执行
1. 打开 SQL Editor
2. 复制 supabase/migrations/003_add_credit_transactions.sql 内容
3. 点击 Run 执行
```

### 2. 验证数据库表

执行以下 SQL 确认表已创建：

```sql
-- 检查 credit_transactions 表
SELECT * FROM credit_transactions LIMIT 1;

-- 检查函数是否存在
SELECT proname FROM pg_proc WHERE proname IN ('add_user_credits', 'deduct_user_credits');
```

---

## 测试支付流程

### 1. 本地测试准备

```bash
# 启动开发服务器
npm run dev

# 使用 ngrok 暴露本地服务器（用于接收 webhook）
npx ngrok http 3000
```

### 2. 配置 Webhook URL

将 ngrok 提供的 HTTPS URL 配置到：
- Clerk Webhook: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
- Lemon Squeezy Webhook: `https://your-ngrok-url.ngrok.io/api/webhooks/lemonsqueezy`

### 3. 测试用户注册流程

1. 访问 `http://localhost:3000/sign-up`
2. 注册新用户
3. 检查 Supabase `users` 表，确认用户已创建且 `credits_remaining = 100`
4. 检查 `credit_transactions` 表，确认有初始积分记录

### 4. 测试购买流程

1. 登录后访问 `http://localhost:3000/credits`
2. 选择任意套餐点击"立即购买"
3. 在 Lemon Squeezy 测试环境完成支付
4. 等待 webhook 回调（查看服务器日志）
5. 刷新页面，确认积分已增加
6. 访问 `http://localhost:3000/credit-history` 查看交易记录

### 5. 测试积分消费

1. 访问任意功能页面（如压缩、抠图）
2. 上传文件并处理
3. 检查积分是否正确扣除
4. 查看交易历史记录

---

## 积分消耗标准

当前设置的积分消耗标准（`lib/quota.ts`）：

| 功能 | 消耗积分 |
|------|---------|
| 图片压缩 | 1 积分 |
| AI 抠图 | 2 积分 |
| 图像识别 | 5 积分 |
| AI 生成 | 10 积分 |

可以根据实际成本调整这些数值。

---

## 初始积分设置

新用户注册时赠送的初始积分设置在 `app/api/webhooks/clerk/route.ts`：

```typescript
const INITIAL_CREDITS = 100; // 可以修改此值
```

---

## 常见问题

### Q: Webhook 没有触发怎么办？

A: 检查以下几点：
1. Webhook URL 是否正确（必须是 HTTPS）
2. Webhook Secret 是否正确配置
3. 查看服务器日志是否有错误
4. 在 Clerk/Lemon Squeezy Dashboard 查看 Webhook 发送记录

### Q: 支付成功但积分没有增加？

A:
1. 检查 Lemon Squeezy Webhook 是否成功调用
2. 查看服务器日志中的错误信息
3. 确认 `custom_data` 中包含正确的 `user_id` 和 `package_id`
4. 检查数据库函数 `add_user_credits` 是否正确执行

### Q: 如何修改积分套餐价格？

A: 修改 `lib/pricing.ts` 中的 `CREDIT_PACKAGES` 配置，并在 Lemon Squeezy Dashboard 中相应调整产品价格。

### Q: 支持人民币支付吗？

A: Lemon Squeezy 支持多种货币。在创建产品时可以设置人民币价格，但最终以美元为基准。

---

## 生产环境部署注意事项

### 1. 使用生产环境的 API Keys

- 确保使用 Clerk 和 Lemon Squeezy 的生产环境 Keys
- 不要在代码中硬编码任何密钥

### 2. 配置正确的 Webhook URLs

生产环境 Webhook URLs 格式：
- Clerk: `https://your-domain.com/api/webhooks/clerk`
- Lemon Squeezy: `https://your-domain.com/api/webhooks/lemonsqueezy`

### 3. 监控和日志

- 使用 Sentry 或类似工具监控错误
- 记录所有支付相关的操作日志
- 定期检查 webhook 调用记录

### 4. 安全措施

- 始终验证 Webhook 签名
- 使用 HTTPS
- 定期更新 API Keys
- 限制 API 调用频率

---

**配置完成后，积分系统即可正常运行！** 🎉

如有问题，请查看相关文档或联系技术支持。
