import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Zap, TrendingUp, FolderOpen } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
  const { data: recentCarousels } = await supabase
    .from("carousels")
    .select("id, title, topic, slide_count, created_at, theme")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const name = profile?.full_name?.split(" ")[0] ?? "Criador";
  const used = profile?.carousels_used_this_month ?? 0;
  const limit = profile?.plan === "business" ? -1 : profile?.plan === "pro" ? 30 : 3;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Olá, {name} 👋</h1>
          <p className="text-white/50 mt-1">Pronto para criar conteúdo incrível hoje?</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/new"><Plus className="h-4 w-4" /> Novo carrossel</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: "Este mês", value: `${used}${limit === -1 ? "" : `/${limit}`}`, sub: "carrosséis criados", color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { icon: FolderOpen, label: "Total", value: recentCarousels?.length ?? 0, sub: "carrosséis salvos", color: "text-purple-400", bg: "bg-purple-500/10" },
          { icon: TrendingUp, label: "Plano", value: (profile?.plan ?? "free").toUpperCase(), sub: "atual", color: "text-pink-400", bg: "bg-pink-500/10" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-white/40">{sub}</p>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      {limit !== -1 && used >= limit && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-400">Limite mensal atingido</p>
            <p className="text-sm text-white/50">Faça upgrade para criar carrosséis ilimitados.</p>
          </div>
          <Button asChild variant="gradient" size="sm">
            <Link href="/settings/billing">Fazer upgrade</Link>
          </Button>
        </div>
      )}

      {/* Recent carousels */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Carrosséis recentes</h2>
          <Link href="/carousels" className="text-sm text-indigo-400 hover:text-indigo-300">Ver todos →</Link>
        </div>

        {!recentCarousels?.length ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="font-semibold text-white mb-2">Nenhum carrossel ainda</p>
            <p className="text-sm text-white/40 mb-6">Crie seu primeiro carrossel em menos de 30 segundos</p>
            <Button asChild variant="gradient">
              <Link href="/new"><Plus className="h-4 w-4" /> Criar primeiro carrossel</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCarousels.map((c) => (
              <Link key={c.id} href={`/carousels/${c.id}`}>
                <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className="h-24 rounded-lg mb-4 flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${c.theme?.bgColor ?? "#1e1b4b"}, #0a0a15)` }}>
                    {c.topic?.slice(0, 1).toUpperCase()}
                  </div>
                  <p className="font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{c.title}</p>
                  <p className="text-sm text-white/40 mt-1 truncate">{c.topic}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/30">{c.slide_count} slides</span>
                    <span className="text-xs text-white/30">{formatRelative(c.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
