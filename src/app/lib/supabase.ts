

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          created_at: string;
          email: string;
          username: string | null;
          password_hash: string | null;
          avatar_url: string | null;
          last_login: string | null;
          id: string;
          first_name: string | null;
          last_name: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          username?: string | null;
          password_hash?: string | null;
          avatar_url?: string | null;
          last_login?: string | null;
          // id: string;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          username?: string | null;
          password_hash?: string | null;
          avatar_url?: string | null;
          last_login?: string | null;
          // id?: string;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          content: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          image_url: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          content: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

function normalizeSupabaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!);
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

// ✅ Database generic must be passed here — this is what makes .from("users") typed
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey,
);

supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error("❌ Supabase connection error:", error.message);
  } else {
    console.log("✅ Supabase Client Initialized & Connected");
  }
});