import "hono";
import type { SupabaseClient } from "@supabase/supabase-js";

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email?: string;
    };
    supabase: SupabaseClient;
  }
}
