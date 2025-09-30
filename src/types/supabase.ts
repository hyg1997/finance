export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          percentage: number;
          can_spend: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          percentage: number;
          can_spend?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          percentage?: number;
          can_spend?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      transactions: {
        Row: {
          id: string;
          user_id: string;
          group_id: string | null;
          amount: number;
          type: Database["public"]["Enums"]["transaction_type"];
          concept: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id?: string | null;
          amount: number;
          type: Database["public"]["Enums"]["transaction_type"];
          concept?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string | null;
          amount?: number;
          type?: Database["public"]["Enums"]["transaction_type"];
          concept?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      user_profile: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profile_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profile_user_id_fkey";
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
      get_user_balances: {
        Args: { p_user_id: string };
        Returns: {
          group_id: string;
          group_name: string;
          percentage: number;
          can_spend: boolean;
          max_amount: number;
          available_amount: number;
          general_max: number;
          total_available: number;
        }[];
      };
      get_user_summary: {
        Args: { p_user_id: string };
        Returns: {
          general_max: number;
          total_available: number;
        }[];
      };
      initialize_user_defaults: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };

    Enums: {
      transaction_type: "income" | "expense";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profile"]["Row"];

export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
export type UserProfileInsert =
  Database["public"]["Tables"]["user_profile"]["Insert"];

export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];
export type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];
export type UserProfileUpdate =
  Database["public"]["Tables"]["user_profile"]["Update"];

export type UserBalance =
  Database["public"]["Functions"]["get_user_balances"]["Returns"][0];
export type UserSummary =
  Database["public"]["Functions"]["get_user_summary"]["Returns"][0];

export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export interface TransactionWithGroup extends Transaction {
  group?: Group | null;
}

export interface GroupWithStats extends Group {
  max_amount?: number;
  available_amount?: number;
  transaction_count?: number;
}

export interface TransactionFormData {
  readonly amount: number;
  readonly concept: string;
  readonly type: TransactionType;
  readonly groupId?: string;
}

export interface GroupFormData {
  readonly name: string;
  readonly percentage: number;
  readonly can_spend: boolean;
}

export interface TransactionFormErrors {
  amount?: string;
  concept?: string;
  type?: string;
  groupId?: string;
}

export interface GroupFormErrors {
  name?: string;
  percentage?: string;
  can_spend?: string;
}
