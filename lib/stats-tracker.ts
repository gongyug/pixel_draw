// 统计追踪工具类

export interface TaskStats {
  compress: number;
  removeBg: number;
  recognize: number;
  generate: number;
  total: number;
}

export interface RecentTask {
  id: string;
  type: 'compress' | 'remove-bg' | 'recognize' | 'generate';
  timestamp: string;
  status: 'success' | 'failed';
}

const STATS_KEY = 'pixeldraw_stats';
const TASKS_KEY = 'pixeldraw_recent_tasks';

/**
 * 获取当前统计数据
 */
export function getStats(): TaskStats {
  if (typeof window === 'undefined') {
    return {
      compress: 0,
      removeBg: 0,
      recognize: 0,
      generate: 0,
      total: 0,
    };
  }

  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  return {
    compress: 0,
    removeBg: 0,
    recognize: 0,
    generate: 0,
    total: 0,
  };
}

/**
 * 记录任务使用
 */
export function trackTask(
  type: 'compress' | 'remove-bg' | 'recognize' | 'generate',
  status: 'success' | 'failed' = 'success'
): void {
  if (typeof window === 'undefined') return;

  // 更新统计
  const stats = getStats();
  if (status === 'success') {
    switch (type) {
      case 'compress':
        stats.compress++;
        break;
      case 'remove-bg':
        stats.removeBg++;
        break;
      case 'recognize':
        stats.recognize++;
        break;
      case 'generate':
        stats.generate++;
        break;
    }
    stats.total++;
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));

  // 添加到最近任务
  const tasks = getRecentTasks();
  const newTask: RecentTask = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    status,
  };

  tasks.unshift(newTask);

  // 只保留最近 50 条
  if (tasks.length > 50) {
    tasks.splice(50);
  }

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  // 触发更新事件
  window.dispatchEvent(new Event('pixeldraw_stats_updated'));
}

/**
 * 获取最近任务
 */
export function getRecentTasks(): RecentTask[] {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem(TASKS_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  return [];
}

/**
 * 清空统计数据
 */
export function clearStats(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(TASKS_KEY);
  window.dispatchEvent(new Event('pixeldraw_stats_updated'));
}

/**
 * 导出统计数据
 */
export function exportStats(): { stats: TaskStats; tasks: RecentTask[] } {
  return {
    stats: getStats(),
    tasks: getRecentTasks(),
  };
}
