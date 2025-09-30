import { redirect } from "next/navigation";

import { TransactionsManager } from "@/components/features/transactions/transactions-manager";
import { createReadOnlySupabaseClient } from "@/lib/supabase-server";

export default async function TransactionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createReadOnlySupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      group:groups(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <TransactionsManager
      transactions={transactions ?? []}
      groups={groups ?? []}
    />
  );
}
