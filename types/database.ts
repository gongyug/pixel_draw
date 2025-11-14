export type TaskType = 'compress' | 'remove_bg' | 'recognize' | 'generate';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          task_type: TaskType;
          status: string;
          input_data: Json | null;
          output_data: Json | null;
          credits_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_type: TaskType;
          status?: string;
          input_data?: Json | null;
          output_data?: Json | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_type?: TaskType;
          status?: string;
          input_data?: Json | null;
          output_data?: Json | null;
          credits_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
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
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}