"use server";

import { redirect } from "next/navigation";

import { createServerActionSupabaseClient } from "@/lib/supabase-server";

// Función de validación para datos de autenticación
function validateAuthData(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim()) throw new Error("Email is required");
  if (!password?.trim()) throw new Error("Password is required");

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  return { email: email.trim(), password };
}

export async function signUp(formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    const { email, password } = validateAuthData(formData);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(`Sign up failed: ${error.message}`);

    return { success: true, message: "Check your email to confirm your account" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function signIn(formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    const { email, password } = validateAuthData(formData);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(`Sign in failed: ${error.message}`);

    redirect("/");
  } catch (error) {
    console.error("Sign in error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect errors
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function signOut() {
  try {
    const supabase = await createServerActionSupabaseClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) throw new Error(`Sign out failed: ${error.message}`);

    redirect("/auth");
  } catch (error) {
    console.error("Sign out error:", error);
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect errors
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
