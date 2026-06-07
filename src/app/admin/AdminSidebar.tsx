"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, ArrowLeft, ShieldAlert, ChevronRight } from "lucide-react";

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard Admin" },
  { href: "/admin/updates", icon: Search, label: "Pesquisa de Atualizações" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-red-900/30 bg-[#0f0508]">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-red-900/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-700 to-red-900">
          <ShieldAlert className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm leading-tight">Carrosseiro</span>
          <span className="text-[10px] font-semibold tracking-widest text-red-400 uppercase">Admin</span>
        </div>
        <span className="ml-auto inline-flex items-center rounded-full bg-red-700/30 border border-red-700/50 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-red-700/20 text-red-400"
                  : "text-white/50 hover:bg-red-900/10 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-red-400" : "text-white/40 group-hover:text-white/70"
                )}
              />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3 text-red-400/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-red-900/30">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Voltar ao App
        </Link>
      </div>
    </aside>
  );
}
