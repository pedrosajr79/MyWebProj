import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalendarDays } from "lucide-react";

export const metadata = { title: "Calendário — Carrosseiro" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

  const { data: posts } = await supabase
    .from("social_posts")
    .select(`
      id, platform, status, caption, scheduled_at, published_at, created_at,
      social_connections(account_name),
      carousels(title)
    `)
    .eq("user_id", user!.id)
    .or(`scheduled_at.gte.${start},published_at.gte.${start}`)
    .or(`scheduled_at.lte.${end},published_at.lte.${end}`)
    .order("scheduled_at", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15">
          <CalendarDays className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Calendário Editorial</h1>
          <p className="text-white/50 text-sm">Visualize e gerencie seus posts agendados</p>
        </div>
      </div>
      <CalendarView posts={(posts as never) ?? []} />
    </div>
  );
}
