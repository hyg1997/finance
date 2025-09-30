import { ProfileManager } from "@/components/features/profile/profile-manager";
import { createReadOnlySupabaseClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = await createReadOnlySupabaseClient();

  const { data: user } = await supabase.auth.getUser();

  return <ProfileManager user={user.user!} />;
}
