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
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_tier: string;
          billing_status: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_tier?: string;
          billing_status?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          plan_tier?: string;
          billing_status?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          role: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          role?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          role?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarded_at?: string | null;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          tenant_id: string;
          scenario_key: string;
          status: string;
          config_json: Json;
          display_name: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          scenario_key: string;
          status?: string;
          config_json: Json;
          display_name?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          scenario_key?: string;
          status?: string;
          config_json?: Json;
          display_name?: string | null;
          is_pinned?: boolean;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          scenario_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          scenario_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string | null;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: never;
      };
      signup_allowlist: {
        Row: {
          email: string;
          tenant_id: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          email: string;
          tenant_id?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Scenario = Database["public"]["Tables"]["scenarios"]["Row"];
export type ChatSession = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

export interface ScenarioConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model?: string;
}
