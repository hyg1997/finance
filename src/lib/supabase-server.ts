import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for server-side operations with full cookie access.
 * This client can read and write cookies, making it suitable for authentication flows.
 * 
 * @returns Promise<SupabaseClient> - A configured Supabase client instance
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, ...options }) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch (error) {
            // Silently ignore cookie setting errors in read-only contexts
            console.warn('Cookie setting failed (likely in read-only context):', error);
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client specifically for server actions.
 * This is an alias for createServerSupabaseClient() to maintain semantic clarity.
 * 
 * @returns Promise<SupabaseClient> - A configured Supabase client instance
 */
export async function createServerActionSupabaseClient() {
  return createServerSupabaseClient();
}

/**
 * Creates a read-only Supabase client for server-side operations.
 * This client can only read cookies and won't attempt to set them,
 * making it safe for use in read-only contexts like static generation.
 * 
 * @returns Promise<SupabaseClient> - A configured read-only Supabase client instance
 */
export async function createReadOnlySupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op for read-only contexts
        },
      },
    }
  );
}
