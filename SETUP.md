# PixelDraw 项目设置指南

本文档将指导你完成 PixelDraw 项目的完整设置。

## 🚀 快速开始

### 1. 克隆项目并安装依赖

```bash
# 进入项目目录
cd PixelDraw

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local
```

### 2. 配置环境变量

打开 `.env.local` 文件，按照以下步骤配置各项服务：

## 📦 服务配置详解

### Supabase 数据库配置

#### 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目信息并等待创建完成

#### 步骤 2: 获取 API Keys

1. 在项目面板中，进入 **Settings** → **API**
2. 复制以下信息到 `.env.local`:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public` key → `SUPABASE_ANON_KEY` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ 仅服务端使用)

#### 步骤 3: 执行数据库迁移

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 复制 `supabase/migrations/001_initial_schema.sql` 文件内容
3. 粘贴到编辑器并点击 **Run**
4. 验证所有表已成功创建

> 详细说明请查看 `supabase/README.md`

---

### Clerk 认证服务配置

#### 步骤 1: 创建 Clerk 应用

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 点击 "Add application" 创建新应用
3. 选择认证方式（推荐：Email + Google + GitHub）

#### 步骤 2: 获取 API Keys

1. 在应用面板中，进入 **API Keys**
2. 复制以下信息到 `.env.local`:
   - `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret Key` → `CLERK_SECRET_KEY`

#### 步骤 3: 配置重定向 URL

在 Clerk Dashboard 的 **Paths** 设置中配置：

- **Sign in URL**: `/sign-in`
- **Sign up URL**: `/sign-up`
- **After sign in URL**: `/dashboard`
- **After sign up URL**: `/dashboard`

---

### 火山引擎 AI 服务配置

#### 获取 ARK API Key

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 开通豆包大模型服务
3. 创建 API Key
4. 将 API Key 填入 `.env.local`:
   ```
   ARK_API_KEY=your_ark_api_key_here
   ```

#### 可用模型

- **图像识别**: `doubao-seed-1-6-flash-250828`
- **图像生成**: `doubao-seedream-4-0-250828`

详细 API 文档: https://www.volcengine.com/docs/82379

---

### Remove.bg 抠图服务配置

#### 获取 API Key

1. 访问 [Remove.bg](https://www.remove.bg/users/sign_up)
2. 注册账户（免费提供 50 次/月）
3. 进入 [API Keys](https://www.remove.bg/api#remove-background) 获取密钥
4. 将 API Key 填入 `.env.local`:
   ```
   REMOVE_BG_API_KEY=your_remove_bg_api_key_here
   ```

---

## 🏃 运行项目

配置完所有环境变量后：

```bash
# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

## 📂 项目结构

```
PixelDraw/
├── app/
│   ├── (marketing)/      # 营销页面（首页、价格等）
│   ├── (workspace)/      # 工作区页面（需登录）
│   ├── (auth)/          # 认证页面（登录、注册）
│   └── api/             # API 路由
├── components/
│   ├── ui/              # shadcn/ui 组件
│   └── file-upload.tsx  # 文件上传组件
├── lib/
│   ├── supabase/        # Supabase 客户端
│   ├── env.ts           # 环境变量验证
│   └── utils.ts         # 工具函数
├── supabase/
│   └── migrations/      # 数据库迁移文件
├── types/
│   └── database.ts      # 数据库类型定义
└── middleware.ts        # 路由中间件
```

## 🔧 开发工具

### 推荐的 VS Code 扩展

- **Tailwind CSS IntelliSense** - Tailwind 自动补全
- **Prisma** - 数据库工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

### 常用命令

```bash
# 开发
npm run dev           # 启动开发服务器

# 构建
npm run build         # 生产构建
npm run start         # 启动生产服务器

# 添加 UI 组件
npx shadcn@latest add [component-name]
```

## ⚠️ 常见问题

### Q: Clerk 认证错误 "publishableKey is invalid"

**A:** 检查 `.env.local` 中的 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 是否正确配置。注意：
- 必须使用 `NEXT_PUBLIC_` 前缀
- 确保没有多余的空格或引号
- 重启开发服务器使环境变量生效

### Q: Supabase 连接失败

**A:** 确认：
1. Supabase 项目已正确创建
2. API URL 和 Key 正确复制
3. 数据库迁移已执行
4. 网络连接正常

### Q: 文件上传没有响应

**A:** 检查：
1. 文件大小是否超过限制（默认 50MB）
2. 文件类型是否支持
3. 浏览器控制台是否有错误信息

## 📚 下一步

现在你已完成基础设置，可以：

1. ✅ 浏览首页和各功能页面
2. ✅ 注册账户并登录
3. ✅ 测试文件上传功能
4. 🚧 实现图片压缩 API（参考 PRD.md）
5. 🚧 集成 Remove.bg 抠图功能
6. 🚧 集成火山引擎 AI 服务

完整的功能开发计划请参考 `PRD.md` 文档。

## 🔗 相关文档

- [项目 PRD](./PRD.md) - 产品需求文档
- [Supabase 迁移指南](./supabase/README.md) - 数据库设置
- [CLAUDE.md](./CLAUDE.md) - AI 编程助手指南
- [Next.js 文档](https://nextjs.org/docs)
- [Clerk 文档](https://clerk.com/docs)

---

**需要帮助？** 查看项目 Issues 或创建新的 Issue 提问。
