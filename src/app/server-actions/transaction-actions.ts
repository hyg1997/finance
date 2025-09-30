"use server";

import { revalidatePath } from "next/cache";

import { createServerActionSupabaseClient } from "@/lib/supabase-server";
import { TransactionType } from "@/types/supabase";

// Función optimizada para obtener cliente y usuario
async function getSupabaseAndUser() {
  const supabase = await createServerActionSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(`Authentication error: ${error.message}`);
  if (!user) throw new Error("User not authenticated");

  return { supabase, user };
}

// Función de validación mejorada
function validateTransactionData(formData: FormData) {
  const group_id = (formData.get("group_id") as string) ?? null;
  const amount = parseFloat(formData.get("amount") as string);
  const type = formData.get("type") as "income" | "expense";
  const concept = formData.get("concept") as string;

  if (!amount || amount <= 0) throw new Error("Amount must be greater than 0");
  if (!type || !["income", "expense"].includes(type))
    throw new Error("Invalid transaction type");
  if (!concept?.trim()) throw new Error("Concept is required");

  return { group_id, amount, type, concept: concept.trim() };
}

/**
 * Creates a new transaction in the database.
 * Validates user authentication and transaction data before insertion.
 *
 * @param formData - Form data containing transaction details
 * @returns Promise<{ success: boolean; error?: string; data?: Transaction }>
 */
export async function createTransaction(formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseAndUser();
    const { group_id, amount, type, concept } =
      validateTransactionData(formData);

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          group_id,
          amount,
          type,
          concept,
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Create transaction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing transaction with new data.
 * Validates user ownership and authentication before updating.
 *
 * @param id - Transaction ID to update
 * @param formData - Form data containing updated transaction details
 * @returns Promise<{ success: boolean; error?: string; data?: Transaction }>
 */
export async function updateTransaction(id: string, formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseAndUser();

    const group_id = String(formData.get("group_id"));
    const amount = parseFloat(String(formData.get("amount")));
    const type = formData.get("type") as TransactionType;
    const concept = String(formData.get("concept"));

    if (!id?.trim()) throw new Error("Transaction ID is required");
    if (!group_id?.trim()) throw new Error("Group ID is required");
    if (!amount || amount <= 0)
      throw new Error("Amount must be greater than 0");
    if (!concept?.trim()) throw new Error("Concept is required");

    const { error } = await supabase
      .from("transactions")
      .update({
        group_id,
        amount,
        type,
        concept: concept.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      throw new Error(`Failed to update transaction: ${error.message}`);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Update transaction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a transaction from the database.
 * Validates user ownership and authentication before deletion.
 *
 * @param id - Transaction ID to delete
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteTransaction(id: string) {
  try {
    const { supabase, user } = await getSupabaseAndUser();

    if (!id?.trim()) throw new Error("Transaction ID is required");

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      throw new Error(`Failed to delete transaction: ${error.message}`);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Retrieves all transactions for the authenticated user.
 * Returns transactions ordered by creation date (newest first).
 *
 * @returns Promise<{ success: boolean; error?: string; data?: Transaction[] }>
 */
export async function getTransactions() {
  try {
    const { supabase, user } = await getSupabaseAndUser();

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get transactions error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
