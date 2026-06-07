"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Plus, FolderOpen, CalendarDays, Settings, Zap, ChevronRight, Share2, BarChart3 } from "lucide-react";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/new", icon: Plus, label: "Novo Carrossel" },
  { href: "/carousels", icon: FolderOpen, label: "Meus Carrosséis" },
  { href: "/publish", icon: Share2, label: "Publicar" },
  { href: "/calendar", icon: CalendarDays, label: "Calendário" },
  { href: "/metrics", icon: BarChart3, label: "Métricas" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#0a0a15]">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">Carrosseiro</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-indigo-400" : "text-white/40 group-hover:text-white/70")} />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3 text-indigo-400/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4">
          <p className="text-xs font-semibold text-white mb-1">Plano Free</p>
          <p className="text-xs text-white/50 mb-3">2 de 3 carrosséis usados</p>
          <div className="h-1.5 rounded-full bg-white/10 mb-3">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
          <Link href="/settings/billing" className="block text-center text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Fazer upgrade →
          </Link>
        </div>
      </div>
    </aside>
  );
}
