"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import {
  Download,
  ImageIcon,
  Zap,
  TrendingDown,
  Check,
  Sparkles,
} from "lucide-react";
import { trackTask } from "@/lib/stats-tracker";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";

type CompressMode = 'smart' | 'extreme' | 'lossless' | 'custom';

interface CompressResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  blob: Blob;
  url: string;
  fileName: string;
}

const compressModes = [
  {
    id: 'smart' as CompressMode,
    name: '智能',
    icon: Zap,
    desc: '60-80%',
  },
  {
    id: 'extreme' as CompressMode,
    name: '极限',
    icon: TrendingDown,
    desc: '80-90%',
  },
  {
    id: 'lossless' as CompressMode,
    name: '无损',
    icon: Check,
    desc: '10-30%',
  },
  {
    id: 'custom' as CompressMode,
    name: '自定义',
    icon: Sparkles,
    desc: '开发中',
  },
];

export default function CompressPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMode, setSelectedMode] = useState<CompressMode>('smart');
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CompressResult[]>([]);
  const [error, setError] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;

    setIsCompressing(true);
    setError('');
    setResults([]);
    setProgress(0);

    try {
      const compressedResults: CompressResult[] = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', selectedMode);

        const response = await apiPost('/api/compress', formData);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '压缩失败');
        }

        const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
        const compressedSize = parseInt(response.headers.get('X-Compressed-Size') || '0');
        const compressionRatio = parseFloat(response.headers.get('X-Compression-Ratio') || '0');
        const format = response.headers.get('X-Output-Format') || 'unknown';

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const fileName = file.name.split('.')[0] + `_compressed.${format}`;

        compressedResults.push({
          originalSize,
          compressedSize,
          compressionRatio,
          format,
          blob,
          url,
          fileName,
        });

        setProgress(((i + 1) / totalFiles) * 100);
      }

      setResults(compressedResults);
      compressedResults.forEach(() => {
        trackTask('compress', 'success');
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '压缩过程中发生错误');
      console.error('压缩错误:', err);
      trackTask('compress', 'failed');
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  const handleDownload = (result: CompressResult) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    results.forEach(result => {
      handleDownload(result);
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Compact Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold">图片压缩</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          智能压缩，保持画质同时减小60-90%文件大小
        </p>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid gap-3 lg:grid-cols-[400px,1fr]">
        {/* Left Column: Upload & Settings */}
        <div className="space-y-3">
          {/* Upload Area - No Card, Just Dashed Border */}
          <div>
            <FileUpload
              onFilesSelected={setSelectedFiles}
              maxFiles={5}
              accept={{
                "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
              }}
            />
          </div>

          {/* Compact Settings */}
          <div className="space-y-3">
            {/* Mode Selection - Horizontal */}
            <div>
              <label className="block text-xs font-medium mb-2 text-muted-foreground">
                压缩模式
              </label>
              <div className="grid grid-cols-4 gap-2">
                {compressModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;

                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all font-medium",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                          : "border-gray-400 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300")} />
                      <span className={cn("text-xs", isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{mode.name}</span>
                      <span className={cn("text-[10px]", isSelected ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500")}>{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-950/20 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Compress Button */}
            <Button
              onClick={handleCompress}
              disabled={selectedFiles.length === 0 || isCompressing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isCompressing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  压缩中 {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  开始压缩
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div>
          <label className="block text-xs font-medium mb-2 text-muted-foreground">
            压缩结果
          </label>
          <div className="min-h-[500px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <AnimatePresence mode="wait">
              {isCompressing ? (
                <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <p className="mb-3 text-sm font-medium">正在压缩中...</p>
                  <div className="w-full max-w-xs">
                    <Progress value={progress} className="h-2" />
                    <p className="text-center text-xs text-muted-foreground mt-2">
                      {Math.round(progress)}% 完成
                    </p>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2 p-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-950"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{result.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            -{result.compressionRatio.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(result)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {results.length > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      size="sm"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      下载全部 ({results.length} 个文件)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[500px] flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    上传图片并选择压缩模式后
                    <br />
                    结果将显示在这里
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
