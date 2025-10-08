# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PixelDraw is a Next.js 15 application using React 19, TypeScript, and Tailwind CSS v4. The project uses Turbopack for faster builds and development.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start
```

Development server runs on http://localhost:3000

## Environment Setup

**IMPORTANT**: All API keys and sensitive information must be read from environment variables. Never hardcode credentials.

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your API keys in `.env.local`:
   - Supabase credentials (database)
   - Clerk credentials (authentication)
   - ARK_API_KEY (火山引擎 AI services)
   - REMOVE_BG_API_KEY (Remove.bg API)

## Architecture

### Next.js App Router Structure
- Uses Next.js 15 App Router (`app/` directory)
- `app/layout.tsx`: Root layout with Geist fonts (Sans and Mono) and global styles
- `app/page.tsx`: Home page component
- `app/globals.css`: Global CSS with Tailwind directives

### Third-party Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk.com
- **Image Background Removal**: Remove.bg API
- **AI Image Recognition**: 火山引擎豆包多模态模型 (doubao-seed-1-6-flash-250828)
- **AI Image Generation**: 火山引擎豆包 Seedream 模型 (doubao-seedream-4-0-250828)

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Next.js plugin enabled for type checking

### Styling
- Tailwind CSS v4 with PostCSS
- Geist font family loaded via `next/font/google`
- Dark mode support via CSS variables

## Key Technical Details

### Turbopack
Both `dev` and `build` scripts use the `--turbopack` flag for improved performance. This is the default bundler for this project.

### Font Optimization
Fonts are automatically optimized using Next.js font system with Geist Sans and Geist Mono, exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`).

### Image Optimization
Next.js Image component is used for optimized image loading (see `app/page.tsx`).
