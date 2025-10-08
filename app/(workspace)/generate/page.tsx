"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Sparkles,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Wand2,
  RefreshCw,
  Image as ImageIconLucide,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { trackTask } from "@/lib/stats-tracker";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";

interface GeneratedImage {
  image: string;
  metadata: {
    prompt: string;
    original_prompt: string;
    negative_prompt?: string;
    width: number;
    height: number;
    seed: number;
    optimized: boolean;
    timestamp: string;
  };
}

type AspectRatio = "square" | "landscape" | "portrait";

const aspectRatios = [
  { id: "square" as AspectRatio, name: "1:1", icon: Square, width: 1024, height: 1024 },
  { id: "landscape" as AspectRatio, name: "4:3", icon: RectangleHorizontal, width: 1024, height: 768 },
  { id: "portrait" as AspectRatio, name: "3:4", icon: RectangleVertical, width: 768, height: 1024 },
];

const sizes = [
  { value: 512, label: "512" },
  { value: 768, label: "768" },
  { value: 1024, label: "1024" },
];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("square");
  const [size, setSize] = useState<number>(1024);
  const [seed, setSeed] = useState<string>("");
  const [optimizePrompt, setOptimizePrompt] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("generate_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  const getDimensions = () => {
    const ratio = aspectRatios.find((r) => r.id === aspectRatio);
    if (!ratio) return { width: 1024, height: 1024 };
    const scale = size / 1024;
    return {
      width: Math.round(ratio.width * scale),
      height: Math.round(ratio.height * scale),
    };
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const dims = getDimensions();
      const response = await apiPost("/api/generate", {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        width: dims.width,
        height: dims.height,
        seed: seed ? parseInt(seed) : undefined,
        optimize: optimizePrompt,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成失败");
      }

      const data = await response.json();
      setResult(data);

      // Add to history
      const newHistory = [data, ...history].slice(0, 20); // Keep last 20
      setHistory(newHistory);
      localStorage.setItem("generate_history", JSON.stringify(newHistory));

      trackTask("generate", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成过程中发生错误");
      console.error("生成错误:", err);
      trackTask("generate", "failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageData: string, timestamp: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `generated_${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("generate_history");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Header - Centered */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AI 图像生成</h1>
        <p className="text-base text-muted-foreground">
          用文字描述你的想象，AI 为你创作独一无二的图像
        </p>
      </div>

      {/* Main Input Area - Centered, Max Width */}
      <div className="mx-auto max-w-4xl mb-8">
        {/* Helpful Tips */}
        <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-pink-500" />
          <p>
            提示：详细描述场景、风格、光线等细节，可以生成更精准的图像
          </p>
        </div>

        {/* Large Input Box with Embedded Controls */}
        <div className="rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Prompt Input with Button */}
          <div className="relative">
            <Textarea
              placeholder="例如：一只可爱的橘猫坐在窗边看雪，窗外是飘雪的城市夜景，油画风格，温暖的室内光线，柔和的色调"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none text-base border-0 focus-visible:ring-0 rounded-none p-4 pr-24"
            />
            {/* Small Generate Button - Bottom Right */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              size="sm"
              className="absolute bottom-3 right-3 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 text-white shadow-md"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  生成
                </>
              )}
            </Button>
          </div>

          {/* Embedded Quick Controls */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Label */}
              <span className="text-xs text-muted-foreground font-medium mr-1">比例:</span>

              {/* Aspect Ratio Quick Select */}
              {aspectRatios.map((ratio) => {
                const Icon = ratio.icon;
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      isSelected
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md border-transparent"
                        : "bg-white text-gray-900 hover:bg-pink-50 border-gray-400 hover:border-pink-400 hover:shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-pink-950/20 dark:hover:border-pink-500"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {ratio.name}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

              {/* Label */}
              <span className="text-xs text-muted-foreground font-medium mr-1">尺寸:</span>

              {/* Size Quick Select */}
              {sizes.map((s) => {
                const isSelected = size === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      isSelected
                        ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md border-transparent"
                        : "bg-white text-gray-900 hover:bg-pink-50 border-gray-400 hover:border-pink-400 hover:shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-pink-950/20 dark:hover:border-pink-500"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ml-auto",
                  showAdvanced
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md border-transparent"
                    : "bg-white text-gray-900 hover:bg-pink-50 border-gray-400 hover:border-pink-400 hover:shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-pink-950/20 dark:hover:border-pink-500"
                )}
              >
                高级设置
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180")} />
              </button>
            </div>

            {/* Advanced Options - Expandable */}
            {showAdvanced && (
              <div className="mt-4 pt-4 space-y-3">
                {/* Seed */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    随机种子（控制生成的随机性）
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="留空自动生成"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="flex-1 h-9 text-sm rounded-lg"
                    />
                    <Button variant="outline" size="sm" onClick={handleRandomSeed} className="h-9 rounded-lg">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    负面提示词（排除不想要的元素）
                  </label>
                  <Textarea
                    placeholder="例如：模糊、低质量、扭曲、变形"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    className="resize-none text-sm rounded-lg"
                  />
                </div>

                {/* Optimize Toggle */}
                <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={optimizePrompt}
                    onChange={(e) => setOptimizePrompt(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="flex-1">自动优化提示词（AI 会自动补充和优化你的描述）</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/20 dark:text-red-200 mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Current Result */}
      {(isGenerating || result) && (
        <div className="mx-auto max-w-4xl mb-8">
          <h2 className="text-lg font-semibold mb-4">当前结果</h2>
          <div className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-600 animate-pulse">
                    <Wand2 className="h-8 w-8 text-white" />
                  </div>
                  <p className="mb-3 text-sm font-medium">AI 创作中...</p>
                  <Progress value={50} className="h-2 w-full max-w-xs" />
                  <p className="text-xs text-muted-foreground mt-2">预计 20-40 秒</p>
                </div>
              ) : result ? (
                <div className="p-4">
                  <img
                    src={`data:image/png;base64,${result.image}`}
                    alt="生成结果"
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-xs">
                      <div className="rounded-md bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
                        <span className="text-muted-foreground">尺寸: </span>
                        <span className="font-medium">
                          {result.metadata.width} × {result.metadata.height}
                        </span>
                      </div>
                      <div className="rounded-md bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
                        <span className="text-muted-foreground">种子: </span>
                        <span className="font-medium">{result.metadata.seed}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(result.image, result.metadata.timestamp)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载
                    </Button>
                  </div>
                </div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* History Section - Masonry Layout */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">历史记录</h2>
            <Button
              onClick={clearHistory}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              清空
            </Button>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="break-inside-avoid rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <img
                  src={`data:image/png;base64,${item.image}`}
                  alt={item.metadata.prompt}
                  className="w-full"
                />
                <div className="p-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {item.metadata.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item.metadata.width} × {item.metadata.height}
                    </span>
                    <Button
                      onClick={() => handleDownload(item.image, item.metadata.timestamp)}
                      variant="ghost"
                      size="sm"
                      className="h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
