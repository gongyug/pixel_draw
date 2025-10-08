"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import {
  Download,
  ImageIcon,
  Wand2,
  Scissors,
  Sparkles,
  Image as ImageIconLucide,
  User,
  Package,
  Car,
  Check,
  ChevronDown,
} from "lucide-react";
import { trackTask } from "@/lib/stats-tracker";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";

type RemoveBgSize = "preview" | "full" | "auto";
type RemoveBgType = "auto" | "person" | "product" | "car";
type RemoveBgFormat = "png" | "jpg";

interface RemoveBgResult {
  url: string;
  blob: Blob;
  fileName: string;
  detectedType: string;
  width: number;
  height: number;
  creditsCharged: number;
}

const sizeOptions = [
  { id: "preview" as RemoveBgSize, name: "预览", icon: ImageIconLucide },
  { id: "auto" as RemoveBgSize, name: "自动", icon: Sparkles },
  { id: "full" as RemoveBgSize, name: "全尺寸", icon: Wand2 },
];

const typeOptions = [
  { id: "auto" as RemoveBgType, name: "自动", icon: Sparkles },
  { id: "person" as RemoveBgType, name: "人物", icon: User },
  { id: "product" as RemoveBgType, name: "产品", icon: Package },
  { id: "car" as RemoveBgType, name: "汽车", icon: Car },
];

export default function RemoveBgPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<RemoveBgSize>("auto");
  const [selectedType, setSelectedType] = useState<RemoveBgType>("auto");
  const [selectedFormat, setSelectedFormat] = useState<RemoveBgFormat>("png");
  const [bgColor, setBgColor] = useState<string>("");
  const [bgImageUrl, setBgImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RemoveBgResult | null>(null);
  const [error, setError] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("size", selectedSize);
      formData.append("type", selectedType);
      formData.append("format", selectedFormat);
      if (bgColor) formData.append("bg_color", bgColor);
      if (bgImageUrl) formData.append("bg_image_url", bgImageUrl);

      const response = await apiPost("/api/remove-bg", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "抠图失败");
      }

      const detectedType = response.headers.get("X-Detected-Type") || "unknown";
      const width = parseInt(response.headers.get("X-Width") || "0");
      const height = parseInt(response.headers.get("X-Height") || "0");
      const creditsCharged = parseFloat(response.headers.get("X-Credits-Charged") || "0");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = selectedFile.name.split(".")[0] + "_no_bg.png";

      setResult({
        url,
        blob,
        fileName,
        detectedType,
        width,
        height,
        creditsCharged,
      });

      trackTask("remove-bg", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "抠图过程中发生错误");
      console.error("抠图错误:", err);
      trackTask("remove-bg", "failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">AI 智能抠图</h1>
        <p className="text-sm text-muted-foreground mt-1">
          自动识别主体并移除背景，支持背景替换
        </p>
      </div>

      {/* Main Content - Left-Right Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Original Image */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">原图</h2>
            {selectedFile && (
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>

          {/* Upload or Preview */}
          {!selectedFile ? (
            <FileUpload
              onFilesSelected={handleFileSelected}
              maxFiles={1}
              accept={{
                "image/*": [".png", ".jpg", ".jpeg", ".webp"],
              }}
            />
          ) : (
            <div className="relative rounded-lg border-2 border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-950">
              <img
                src={previewUrl}
                alt="上传的图片"
                className="w-full h-auto max-h-[500px] object-contain"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setResult(null);
                }}
                className="absolute top-2 right-2"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                重新上传
              </Button>
            </div>
          )}
        </div>

        {/* Right: Controls & Result */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">抠图结果</h2>

          {/* Settings - Only show when image is uploaded and no result yet */}
          {selectedFile && !result && !isProcessing && (
            <div className="space-y-4">
              {/* Quick Settings */}
              <div className="grid grid-cols-2 gap-3">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    主体类型
                  </label>
                  <div className="space-y-2">
                    {typeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedType === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedType(option.id)}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-lg border-2 p-2 transition-all font-medium",
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm"
                              : "border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300")} />
                          <span className={cn("text-xs", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block text-xs font-medium mb-2 text-muted-foreground">
                    输出尺寸
                  </label>
                  <div className="space-y-2">
                    {sizeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedSize === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedSize(option.id)}
                          className={cn(
                            "w-full flex items-center gap-2 rounded-lg border-2 p-2 transition-all font-medium",
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm"
                              : "border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300")} />
                          <span className={cn("text-xs", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Advanced Settings - Collapsible */}
              <details
                className="rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"
                open={showAdvanced}
                onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer p-3 text-sm font-medium flex items-center justify-between hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg">
                  <span>高级选项（可选）</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
                </summary>

                <div className="p-3 pt-2 space-y-3">
                  {/* Format */}
                  <div>
                    <label className="block text-xs font-medium mb-2 text-muted-foreground">
                      输出格式
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedFormat("png")}
                        className={cn(
                          "rounded-lg border-2 p-2 text-xs font-medium transition-all",
                          selectedFormat === "png"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm"
                            : "border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                        )}
                      >
                        PNG（透明）
                      </button>
                      <button
                        onClick={() => setSelectedFormat("jpg")}
                        className={cn(
                          "rounded-lg border-2 p-2 text-xs font-medium transition-all",
                          selectedFormat === "jpg"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-sm"
                            : "border-gray-400 bg-white hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                        )}
                      >
                        JPG
                      </button>
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-xs font-medium mb-2 text-muted-foreground">
                      背景颜色
                    </label>
                    <Input
                      type="text"
                      placeholder="#ffffff 或颜色名"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-xs font-medium mb-2 text-muted-foreground">
                      背景图片 URL
                    </label>
                    <Input
                      type="text"
                      placeholder="https://..."
                      value={bgImageUrl}
                      onChange={(e) => setBgImageUrl(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </details>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/20 dark:text-red-200">
                  {error}
                </div>
              )}

              {/* Process Button */}
              <Button
                onClick={handleRemoveBackground}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                    AI 处理中...
                  </>
                ) : (
                  <>
                    <Scissors className="mr-2 h-5 w-5" />
                    开始抠图
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 animate-pulse">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <p className="mb-3 text-sm font-medium">AI 智能处理中...</p>
              <Progress value={50} className="h-2 w-full max-w-xs" />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Result Image with Checkered Background */}
              <div
                className="relative rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#e5e5e5 0% 25%, transparent 0% 50%) 50% / 20px 20px",
                }}
              >
                <img
                  src={result.url}
                  alt="抠图结果"
                  className="w-full object-contain"
                  style={{ maxHeight: "500px" }}
                />
              </div>

              {/* Result Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800">
                  <span className="text-muted-foreground">尺寸: </span>
                  <span className="font-medium">
                    {result.width} × {result.height}
                  </span>
                </div>
                <div className="rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800">
                  <span className="text-muted-foreground">类型: </span>
                  <span className="font-medium">{result.detectedType}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载图片
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                  }}
                  className="flex-1"
                >
                  重新抠图
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setResult(null);
                }}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                更换图片
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!selectedFile && (
            <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                <Scissors className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                请先上传图片
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
