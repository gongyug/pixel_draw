'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * 全局 SWR 配置提供者
 * 统一管理数据获取、缓存、重新验证策略
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // 全局错误处理
        onError: (error, key) => {
          console.error('SWR Error:', key, error);
        },
        // 全局成功处理（可选）
        onSuccess: (data, key) => {
          // console.log('SWR Success:', key, data);
        },
        // 重新验证选项
        revalidateOnFocus: true,        // 窗口聚焦时重新验证
        revalidateOnReconnect: true,    // 网络重连时重新验证
        refreshInterval: 0,              // 默认不自动刷新（各 hook 可覆盖）
        dedupingInterval: 2000,          // 2秒内的重复请求去重
        // 错误重试
        errorRetryCount: 3,              // 最多重试3次
        errorRetryInterval: 5000,        // 重试间隔5秒
        // 加载超时
        loadingTimeout: 3000,            // 3秒超时
        // 缓存选项
        shouldRetryOnError: true,        // 错误时是否重试
        // 焦点重新验证的节流
        focusThrottleInterval: 5000,     // 5秒内最多重新验证一次
      }}
    >
      {children}
    </SWRConfig>
  );
}
