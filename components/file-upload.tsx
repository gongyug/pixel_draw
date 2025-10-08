"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Check, AlertCircle, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUpload({
  onFilesSelected,
  accept = {
    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 1,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("不支持的文件格式");
        } else if (rejection.errors[0]?.code === "too-many-files") {
          setError(`最多只能上传 ${maxFiles} 个文件`);
        } else {
          setError("文件上传失败，请重试");
        }
        return;
      }

      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles((prev) => {
        const combined = [...prev, ...filesWithPreview];
        return maxFiles === 1 ? [filesWithPreview[0]] : combined.slice(0, maxFiles);
      });

      if (onFilesSelected) {
        onFilesSelected(maxFiles === 1 ? [acceptedFiles[0]] : acceptedFiles);
      }
    },
    [maxSize, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    const newFiles = files.filter((file) => file !== fileToRemove);
    setFiles(newFiles);
    if (onFilesSelected) {
      onFilesSelected(newFiles);
    }
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const { ref: dropzoneRef, ...rootProps } = getRootProps();

  return (
    <div className={cn("w-full space-y-4", className)}>
      <motion.div
        ref={dropzoneRef as any}
        {...(rootProps as any)}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed border-border transition-all duration-300",
          isDragActive
            ? "border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-950/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600",
          error && "border-red-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-4 p-12">
          {/* Animated Icon */}
          <motion.div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDragActive
                ? "bg-blue-100 dark:bg-blue-900"
                : "bg-gray-100 dark:bg-gray-800"
            )}
            animate={{
              scale: isDragActive ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.6,
              repeat: isDragActive ? Infinity : 0,
              repeatType: "reverse",
            }}
          >
            <Upload
              className={cn(
                "h-8 w-8 transition-colors",
                isDragActive ? "text-blue-600" : "text-gray-600 dark:text-gray-400"
              )}
            />
          </motion.div>

          {/* Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? "放开以上传文件" : "拖拽文件至此"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              或点击选择文件
            </p>
          </div>

          {/* Format Info */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>支持格式: JPG, PNG, GIF, WebP, SVG</span>
            <span>•</span>
            <span>最大 {maxSize / 1024 / 1024}MB</span>
            {maxFiles > 1 && (
              <>
                <span>•</span>
                <span>最多 {maxFiles} 个文件</span>
              </>
            )}
          </div>

          {/* Button */}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            disabled={disabled}
          >
            选择文件
          </Button>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* File Preview List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              已选择 {files.length} 个文件:
            </p>
            {files.map((file, index) => (
              <motion.div
                key={file.name + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 rounded-lg border-border bg-white p-3 shadow-sm dark:bg-gray-950"
              >
                {/* Preview Image or Icon */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-full w-full object-cover"
                      onLoad={() => {
                        URL.revokeObjectURL(file.preview!);
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileImage className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950"
                >
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </motion.div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
