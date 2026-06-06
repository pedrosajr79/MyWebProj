"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, LogOut, Settings, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Props {
  user: { email?: string } | null;
  profile: { full_name?: string; plan?: string } | null;
}

export function TopBar({ user, profile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = (profile?.full_name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0a0a15] px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{profile?.full_name ?? "Usuário"}</p>
              <p className="text-xs text-white/40 capitalize">{profile?.plan ?? "free"}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#0f0f1e] shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/5">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <Settings className="h-4 w-4" /> Configurações
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
