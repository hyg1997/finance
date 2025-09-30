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

// Función de validación para datos de grupo
function validateGroupData(formData: FormData) {
  const name = formData.get("name") as string;
  const percentage = parseFloat(formData.get("percentage") as string);
  const can_spend = formData.get("can_spend") === "true";

  if (!name?.trim()) throw new Error("Group name is required");
  if (!percentage || percentage <= 0 || percentage > 100) {
    throw new Error("Percentage must be between 1 and 100");
  }

  return { name: name.trim(), percentage, can_spend };
}

/**
 * Creates a new group in the database.
 * Validates user authentication and group data before insertion.
 * 
 * @param formData - Form data containing group details (name, description, color)
 * @returns Promise<{ success: boolean; error?: string; data?: Group }>
 */
export async function createGroup(formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    const user = await getUserOrThrow(supabase);
    const { name, percentage, can_spend } = validateGroupData(formData);

    const { error } = await supabase.from("groups").insert({
      user_id: user.id,
      name,
      percentage,
      can_spend,
    });

    if (error) throw new Error(`Failed to create group: ${error.message}`);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Create group error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Updates an existing group with new data.
 * Validates user ownership and authentication before updating.
 * 
 * @param id - Group ID to update
 * @param formData - Form data containing updated group details
 * @returns Promise<{ success: boolean; error?: string; data?: Group }>
 */
export async function updateGroup(id: string, formData: FormData) {
  try {
    const supabase = await createServerActionSupabaseClient();
    const user = await getUserOrThrow(supabase);

    if (!id?.trim()) throw new Error("Group ID is required");

    const { name, percentage, can_spend } = validateGroupData(formData);

    const { error } = await supabase
      .from("groups")
      .update({
        name,
        percentage,
        can_spend,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(`Failed to update group: ${error.message}`);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update group error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Deletes a group from the database.
 * Validates user ownership and authentication before deletion.
 * Also deletes all associated transactions.
 * 
 * @param id - Group ID to delete
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteGroup(id: string) {
  try {
    const supabase = await createServerActionSupabaseClient();
    const user = await getUserOrThrow(supabase);

    if (!id?.trim()) throw new Error("Group ID is required");

    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new Error(`Failed to delete group: ${error.message}`);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete group error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

/**
 * Retrieves all groups for the authenticated user.
 * Returns groups with their associated transaction counts and totals.
 * 
 * @returns Promise<{ success: boolean; error?: string; data?: GroupWithStats[] }>
 */
export async function getGroups() {
  try {
    const supabase = await createServerActionSupabaseClient();
    const user = await getUserOrThrow(supabase);

    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch groups: ${error.message}`);

    return { success: true, data };
  } catch (error) {
    console.error("Get groups error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}
