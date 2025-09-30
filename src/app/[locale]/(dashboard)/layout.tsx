import { redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { createReadOnlySupabaseClient } from "@/lib/supabase-server";

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const supabase = await createReadOnlySupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Header userName={userProfile?.full_name || user.email || ""} />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
