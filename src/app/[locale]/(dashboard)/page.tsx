import { createReadOnlySupabaseClient } from "@/lib/supabase-server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { GroupsSection } from "@/components/dashboard/groups-section";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AddTransactionFAB } from "@/components/features/add-transaction/add-transaction-fab";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
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

  const { data: balances } = await supabase.rpc("get_user_balances", {
    p_user_id: user.id,
  });

  const { data: summary } = await supabase
    .rpc("get_user_summary", { p_user_id: user.id })
    .single();

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      group:groups(*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-background">
      <div className="py-6 sm:py-8 space-y-6 sm:space-y-8">
        <SummaryCards summary={summary} locale={locale} />
        <GroupsSection balances={balances} locale={locale} />
        <RecentTransactions transactions={recentTransactions} locale={locale} />
      </div>

      <AddTransactionFAB groups={groups ?? []} />
    </div>
  );
}
