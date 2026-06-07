import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { isOwner } from "@/lib/admin";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isOwner(user.email)) notFound();

  return (
    <div className="flex h-screen bg-[#080508] overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-3 px-6 border-b border-red-900/20 bg-[#0f0508]">
          <span className="text-sm text-white/40">
            Painel Administrativo — acesso restrito ao proprietário
          </span>
          <span className="ml-auto text-xs text-red-400/70 font-mono">{user.email}</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
