import { supabaseService } from './supabase/service';
import { TaskType } from '@/types/database';

interface TaskPayload {
  userId: string;
  taskType: TaskType;
  input?: Record<string, any>;
}

class TaskManager {
  async createTask(payload: TaskPayload) {
    const { data, error } = await supabaseService
      .from('tasks')
      .insert({
        user_id: payload.userId,
        task_type: payload.taskType,
        status: 'pending',
        parameters: payload.input,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create task', error);
      return null;
    }
    return data?.id;
  }

  async updateTaskStatus(taskId: string, status: 'processing' | 'completed' | 'failed', result?: Record<string, any>, creditsUsed?: number, errorMessage?: string) {
    const { error } = await supabaseService
      .from('tasks')
      .update({
        status,
        result: result,
        credits_used: creditsUsed,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error(`Failed to update task ${taskId} to ${status}` , error);
    }
  }
}

export const taskManager = new TaskManager();
