"use server";

import { revalidatePath } from "next/cache";

import { createServerActionSupabaseClient } from "@/lib/supabase-server";

// Función optimizada para obtener usuario autenticado
async function getUserOrThrow(
  supabase: Awaited<ReturnType<typeof createServerActionSupabaseClient>>
) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(`Authentication error: ${error.message}`);
  if (!user) throw new Error("User not authenticated");
  return user;
}

// Función de validación para datos de perfil
function validateProfileData(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name?.trim()) throw new Error("Name is required");
  if (!email?.trim()) throw new Error("Email is required");

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email format");

  return { name: name.trim(), email: email.trim() };
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    await getUserOrThrow(supabase);
    const { name, email } = validateProfileData(formData);

    // Actualizar el perfil del usuario
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      data: { name },
    });

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    revalidatePath("/profile");
    return { 
      success: true, 
      message: "Profile updated successfully" 
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    await getUserOrThrow(supabase); // Verificar autenticación

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword?.trim()) throw new Error("Current password is required");
    if (!newPassword?.trim()) throw new Error("New password is required");
    if (!confirmPassword?.trim()) throw new Error("Password confirmation is required");

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New passwords do not match");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }

    return { 
      success: true, 
      message: "Password updated successfully" 
    };
  } catch (error) {
    console.error("Update password error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
