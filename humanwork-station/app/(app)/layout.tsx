import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // First-time user — redirect to onboarding
  if (profile && !profile.onboarded_at && !isOnboardingPath()) {
    // handled in each page via check
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar user={user} profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function isOnboardingPath() {
  return false; // middleware handles this
}
