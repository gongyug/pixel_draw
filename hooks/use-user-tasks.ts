'use client';

import useSWR from 'swr';
import { apiGet } from '@/lib/api';

interface Task {
  id: string;
  type: 'compress' | 'remove-bg' | 'recognize' | 'generate';
  timestamp: string;
  status: 'success' | 'failed';
  creditsUsed: number;
}

interface TasksResponse {
  tasks: Task[];
}

const fetcher = async (url: string): Promise<TasksResponse> => {
  const response = await apiGet(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

/**
 * Hook to fetch user's recent tasks
 * Uses SWR for automatic caching and revalidation
 */
export function useUserTasks() {
  const { data, error, isLoading, mutate } = useSWR<TasksResponse>(
    '/api/user-tasks',
    fetcher,
    {
      refreshInterval: 60000, // 每60秒刷新一次
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    tasks: data?.tasks ?? [],
    isLoading,
    isError: error,
    mutate, // 用于手动刷新（完成任务后可调用）
  };
}
