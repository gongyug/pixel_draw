export type TaskType = 'compress' | 'remove_bg' | 'recognize' | 'generate';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          credits_remaining: number;
          // ... other fields
        };
        Insert: {
          // ...
        };
        Update: {
          credits_remaining?: number;
          // ...
        };
      };
      // ... other tables
    };
    Functions: {
      deduct_user_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
        };
        Returns: void;
      };
    };
  };
}