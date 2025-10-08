"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import {
  Download,
  ImageIcon,
  Eye,
  ScanSearch,
  FileText,
  Brain,
  Check,
  Copy,
} from "lucide-react";
import { trackTask } from "@/lib/stats-tracker";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { apiPost } from "@/lib/api";

type RecognitionType = "describe" | "detect_objects" | "extract_text" | "analyze";

interface RecognitionResult {
  type: RecognitionType;
  result: string;
  timestamp: string;
}

const recognitionTypes = [
  { id: "describe" as RecognitionType, name: "图像描述", icon: Eye },
  { id: "detect_objects" as RecognitionType, name: "物体识别", icon: ScanSearch },
  { id: "extract_text" as RecognitionType, name: "OCR 文字", icon: FileText },
  { id: "analyze" as RecognitionType, name: "自定义分析", icon: Brain },
];

export default function RecognitionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedType, setSelectedType] = useState<RecognitionType>("describe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const handleRecognize = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", selectedType);

      const response = await apiPost("/api/recognize", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "识别失败");
      }

      const data = await response.json();
      setResult(data);
      trackTask("recognize", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "识别过程中发生错误");
      console.error("识别错误:", err);
      trackTask("recognize", "failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">图像识别</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI 识别图片内容、提取文字和物体信息
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

        {/* Right: Recognition Controls & Results */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">识别结果</h2>

          {/* Recognition Type Selection */}
          {selectedFile && !result && !isProcessing && (
            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground">
                选择识别类型
              </label>
              <div className="grid grid-cols-2 gap-3">
                {recognitionTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                                                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all font-medium",                        isSelected
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm"
                          : "border-gray-400 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300")} />
                      <span className={cn("text-sm", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{type.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/20 dark:text-red-200 mt-3">
                  {error}
                </div>
              )}

              {/* Recognize Button */}
              <Button
                onClick={handleRecognize}
                disabled={!selectedFile || isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 mt-4"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Brain className="mr-2 h-5 w-5 animate-spin" />
                    AI 识别中...
                  </>
                ) : (
                  <>
                    <ScanSearch className="mr-2 h-5 w-5" />
                    开始识别
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 animate-pulse">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <p className="mb-3 text-sm font-medium">AI 识别中...</p>
              <Progress value={50} className="h-2 w-full max-w-xs" />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-3">
              <div className="rounded-lg border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-100 dark:bg-green-950">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">识别完成</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        复制结果
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900 max-h-[400px] overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none
                      prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:mb-3 prose-headings:mt-4
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                      prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                      prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-4
                      prose-ol:list-decimal prose-ol:ml-4 prose-ol:mb-4
                      prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:mb-1
                      prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-4">
                    <ReactMarkdown>
                      {result.result}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                  }}
                  className="flex-1"
                >
                  重新识别
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setResult(null);
                  }}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  更换图片
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedFile && (
            <div className="flex flex-col items-center justify-center p-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                <Eye className="h-8 w-8 text-gray-400" />
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
