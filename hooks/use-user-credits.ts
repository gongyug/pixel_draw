'use client';

import useSWR from 'swr';
import { apiGet } from '@/lib/api';

interface CreditsResponse {
  credits: number;
}

const fetcher = async (url: string): Promise<CreditsResponse> => {
  const response = await apiGet(url);
  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }
  return response.json();
};

/**
 * Hook to fetch and manage user credits
 * Uses SWR for automatic caching, revalidation, and deduplication
 */
export function useUserCredits() {
  const { data, error, isLoading, mutate } = useSWR<CreditsResponse>(
    '/api/user-credits',
    fetcher,
    {
      refreshInterval: 30000, // 自动每30秒刷新
      revalidateOnFocus: true, // 窗口聚焦时重新验证
      dedupingInterval: 2000, // 2秒内的重复请求会被去重
    }
  );

  return {
    credits: data?.credits ?? null,
    isLoading,
    isError: error,
    mutate, // 用于手动刷新数据（充值后可调用）
  };
}
