"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Zap,
  Scissors,
  Eye,
  Sparkles,
  Upload,
  Settings,
  Download,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "图片压缩",
    description: "智能压缩，保持画质的同时减小60-90%文件大小",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    href: "/compress",
  },
  {
    icon: Scissors,
    title: "AI 智能抠图",
    description: "一键自动抠图，精准识别主体并移除背景",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    href: "/remove-bg",
  },
  {
    icon: Eye,
    title: "图像识别",
    description: "AI 识别图片内容，支持OCR文字提取和物体识别",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    href: "/recognition",
  },
  {
    icon: Sparkles,
    title: "AI 图像生成",
    description: "根据文字描述生成高质量图像，支持多种风格",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    href: "/generate",
  },
];

const steps = [
  {
    icon: Upload,
    title: "上传图片",
    description: "拖拽或点击上传您的图片",
  },
  {
    icon: Settings,
    title: "AI 自动处理",
    description: "选择功能，AI 智能优化",
  },
  {
    icon: Download,
    title: "下载结果",
    description: "一键下载处理后的图片",
  },
];

const highlights = [
  "零学习成本，上传即处理",
  "AI 驱动，智能优化参数",
  "支持批量处理，提升效率",
  "保护隐私，7天后自动删除",
];

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
          <div className="absolute right-1/4 top-1/3 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />
        </div>

        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Sparkles className="h-4 w-4" />
                <span>AI 驱动的图片处理平台</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              一站式智能图片
              <br />
              处理解决方案
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              压缩 · 抠图 · 识别 · 生成
              <br />
              无需学习，上传即用，让 AI 为您的图片赋能
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                asChild
              >
                <Link href="/compress">
                  开始使用
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">查看功能</Link>
              </Button>
            </motion.div>

            {/* Highlights */}
            <motion.div
              className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{highlight}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <motion.h2
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              强大的 AI 功能
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              四大核心功能，满足您的所有图片处理需求
            </motion.p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={feature.href}>
                    <Card className="group h-full p-6 transition-all hover:scale-105 hover:shadow-lg cursor-pointer hover:border-blue-500">
                      <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.bgColor}`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        <span>立即体验</span>
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <motion.h2
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              三步完成处理
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              简单快捷的操作流程，让图片处理变得轻松
            </motion.p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700 sm:block" />
                  )}

                  <div className="relative text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute left-1/2 top-16 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-600 shadow-md dark:bg-gray-800 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold mt-4">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/compress">
                立即开始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="grid gap-8 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1M+</div>
              <div className="mt-2 text-muted-foreground">图片已处理</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">50K+</div>
              <div className="mt-2 text-muted-foreground">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">99.9%</div>
              <div className="mt-2 text-muted-foreground">用户满意度</div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
