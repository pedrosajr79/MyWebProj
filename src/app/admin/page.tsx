import { createServiceClient } from "@/lib/supabase/service";
import { Users, LayoutGrid, TrendingUp, ShieldCheck } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ label, value, icon, description }: StatCardProps) {
  return (
    <div className="rounded-xl border border-red-900/20 bg-[#130b0b] p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/50">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-900/20 text-red-400">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {description && <p className="text-xs text-white/30">{description}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const supabase = createServiceClient();

  const [
    { count: totalUsers },
    { count: totalCarousels },
    { data: planRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("carousels").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("plan")
      .then(({ data }) => ({ data })),
  ]);

  // Aggregate plan distribution from client-side data
  const planDist: Record<string, number> = { free: 0, pro: 0, business: 0 };
  for (const row of planRows ?? []) {
    const p = row.plan as string;
    if (p in planDist) planDist[p]++;
  }

  const { count: totalResearches } = await supabase
    .from("admin_research")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-sm text-white/40 mt-1">Métricas globais do produto Carrosseiro</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total de Usuários"
          value={totalUsers ?? 0}
          icon={<Users className="h-5 w-5" />}
          description="Contas registradas"
        />
        <StatCard
          label="Carrosséis Gerados"
          value={totalCarousels ?? 0}
          icon={<LayoutGrid className="h-5 w-5" />}
          description="Total acumulado"
        />
        <StatCard
          label="Pesquisas de IA"
          value={totalResearches ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Relatórios de mercado gerados"
        />
        <StatCard
          label="Status"
          value="Online"
          icon={<ShieldCheck className="h-5 w-5" />}
          description="Sistema operacional"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Distribuição de Planos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["free", "pro", "business"] as const).map((plan) => {
            const count = planDist[plan] ?? 0;
            const total = totalUsers ?? 1;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const colors: Record<string, string> = {
              free: "from-zinc-600 to-zinc-700",
              pro: "from-indigo-600 to-purple-600",
              business: "from-amber-500 to-orange-600",
            };
            return (
              <div
                key={plan}
                className="rounded-xl border border-red-900/20 bg-[#130b0b] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white capitalize">{plan}</span>
                  <span className="text-xs text-white/40">{pct}%</span>
                </div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors[plan]} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
