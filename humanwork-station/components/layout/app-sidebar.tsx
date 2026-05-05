"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, LayoutGrid, History, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

const navItems = [
  { href: "/agents", label: "エージェント", icon: LayoutGrid },
  { href: "/history", label: "実行履歴", icon: History },
];

interface AppSidebarProps {
  user: User;
  profile: Profile | null;
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r bg-slate-50 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b font-bold text-slate-900">
        <Bot className="h-5 w-5 text-blue-600" />
        <span className="text-sm">HumanWork Station</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t px-2 py-3">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
            {(profile?.display_name ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">
              {profile?.display_name ?? user.email}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
