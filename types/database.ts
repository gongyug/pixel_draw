export type TaskType = 'compress' | 'remove_bg' | 'recognize' | 'generate';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan_type: string;
          credits_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          plan_type?: string;
          credits_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          plan_type?: string;
          credits_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          description: string | null;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: string;
          description?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: string;
          description?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          task_type: TaskType;
          status: string;
          input_data: any;
          output_data: any;
          credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_type: TaskType;
          status?: string;
          input_data?: any;
          output_data?: any;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_type?: TaskType;
          status?: string;
          input_data?: any;
          output_data?: any;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      deduct_user_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
        };
        Returns: void;
      };
      add_user_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: string;
          p_description: string;
          p_order_id: string;
        };
        Returns: void;
      };
    };
  };
}