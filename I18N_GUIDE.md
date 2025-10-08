# 国际化 (i18n) 使用指南

## 已完成的工作

### ✅ 1. 基础配置
- 安装 `next-intl` 包
- 创建语言配置文件 (`messages/zh.json`, `messages/en.json`)
- 配置 Next.js 中间件支持国际化
- 集成 Clerk 认证中间件和 i18n 中间件

### ✅ 2. 语言切换功能
- 创建 `LanguageSwitcher` 组件（位于 `components/language-switcher.tsx`）
- 添加到 `MarketingHeader` 组件
- 使用 Cookie 存储语言偏好 (`NEXT_LOCALE`)
- 支持的语言：中文 (zh) 和英文 (en)

### ✅ 3. 翻译系统
- 翻译文件位于 `messages/` 目录
- 支持嵌套的翻译键
- 已翻译的模块：
  - common（通用）
  - nav（导航）
  - home（首页）
  - dashboard（仪表盘）
  - compress（压缩）
  - removeBg（背景移除）
  - recognize（识别）
  - generate（生成）
  - credits（积分）
  - user（用户）
  - errors（错误）
  - success（成功）

## 如何使用翻译

### 在客户端组件中

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('nav'); // 指定翻译命名空间

  return (
    <div>
      <h1>{t('home')}</h1> {/* 使用翻译键 */}
      <p>{t('dashboard')}</p>
    </div>
  );
}
```

### 在服务器组件中

```tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('home');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

## 待完成的工作

### 📝 需要翻译的组件

以下组件还需要添加国际化支持：

1. **工作台导航** (`components/workspace-header.tsx`)
   - 导航菜单项（仪表盘、图片压缩、AI 智能抠图等）
   - 积分显示文本

2. **首页** (`app/(marketing)/page.tsx`)
   - 英雄区标题和描述
   - 功能介绍卡片
   - CTA 按钮

3. **仪表盘** (`app/(workspace)/dashboard/page.tsx`)
   - 欢迎消息
   - 统计卡片
   - 快捷操作

4. **工具页面**
   - 图片压缩 (`app/(workspace)/compress/page.tsx`)
   - 背景移除 (`app/(workspace)/remove-bg/page.tsx`)
   - 图片识别 (`app/(workspace)/recognition/page.tsx`)
   - AI 生图 (`app/(workspace)/generate/page.tsx`)

5. **积分相关**
   - 积分中心 (`app/(workspace)/credits/page.tsx`)
   - 积分历史 (`app/(workspace)/credit-history/page.tsx`)

6. **组件**
   - 用户菜单 (`components/custom-user-menu.tsx`)
   - 文件上传 (`components/file-upload.tsx`)
   - 其他 UI 组件

## 翻译步骤

### 1. 更新翻译文件

在 `messages/zh.json` 和 `messages/en.json` 中添加新的翻译键：

```json
{
  "myPage": {
    "title": "页面标题",
    "description": "页面描述"
  }
}
```

### 2. 在组件中使用

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyPage() {
  const t = useTranslations('myPage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 3. 处理动态文本

对于包含变量的文本：

```json
{
  "welcome": "欢迎, {name}!"
}
```

```tsx
const t = useTranslations('common');
<span>{t('welcome', { name: userName })}</span>
```

## 测试国际化

1. **本地测试**
   ```bash
   npm run dev
   ```

2. **切换语言**
   - 点击页面右上角的语言切换器（地球图标）
   - 选择中文或 English
   - 页面会自动刷新并应用新语言

3. **检查 Cookie**
   - 打开浏览器开发工具
   - 查看 Application → Cookies
   - 确认 `NEXT_LOCALE` cookie 已设置

## 注意事项

1. **命名空间**：使用清晰的命名空间组织翻译（如 'nav', 'home', 'errors'）
2. **一致性**：保持中英文翻译的键名一致
3. **格式**：使用正确的 JSON 格式，避免语法错误
4. **上下文**：提供足够的上下文信息使翻译准确
5. **复数**：使用 `{count, plural}` 语法处理复数形式
6. **日期/数字**：使用 next-intl 的格式化功能

## 语言切换流程

1. 用户点击语言切换器
2. 设置 `NEXT_LOCALE` cookie
3. 调用 `router.refresh()` 刷新页面
4. 服务器读取 cookie 中的语言偏好
5. 加载对应的翻译文件
6. 渲染页面时应用新语言

## 优先级建议

1. **高优先级**（用户可见的核心文本）
   - 导航菜单
   - 页面标题和描述
   - 按钮和表单标签
   - 错误消息

2. **中优先级**（增强用户体验）
   - 工具提示
   - 帮助文本
   - 成功消息

3. **低优先级**（可选）
   - Footer 文本
   - SEO 元数据
   - 高级功能描述

## 构建和部署

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

构建会自动包含所有翻译文件，无需额外配置。
