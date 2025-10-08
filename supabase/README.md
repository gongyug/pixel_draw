# Supabase 数据库迁移

## 执行迁移

有两种方式将数据库 schema 应用到 Supabase：

### 方式 1: 通过 Supabase Dashboard（推荐用于开发）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `migrations/001_initial_schema.sql` 文件内容
5. 粘贴到 SQL 编辑器并点击 **Run**

### 方式 2: 通过 Supabase CLI（推荐用于生产）

```bash
# 1. 安装 Supabase CLI
npm install -g supabase

# 2. 登录 Supabase
supabase login

# 3. 链接到你的项目
supabase link --project-ref your-project-ref

# 4. 推送迁移
supabase db push
```

## 数据库表说明

### users (用户表)
- 存储用户基本信息和套餐信息
- 包含剩余积分字段用于限制使用

### tasks (任务记录表)
- 记录所有图片处理任务
- 支持四种任务类型：compress, remove_bg, recognize, generate
- 包含任务状态追踪

### files (文件表)
- 存储上传和处理后的文件信息
- 自动设置 7 天过期时间
- 支持缩略图

### api_usage_logs (API 使用记录表)
- 记录所有 API 调用
- 用于性能监控和使用统计

## 行级安全策略 (RLS)

所有表都已启用 RLS，确保用户只能访问自己的数据。

## 注意事项

⚠️ **重要**: 在生产环境执行迁移前，请务必备份数据库！

```bash
# 备份数据库
supabase db dump -f backup.sql
```
