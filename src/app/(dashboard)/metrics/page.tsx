import { createClient } from "@/lib/supabase/server";
import { BarChart3, Zap, Share2, TrendingUp, Award } from "lucide-react";
import { MetricsCharts } from "@/components/metrics/MetricsCharts";

export const metadata = { title: "Métricas — Carrosseiro" };

const TONE_LABELS: Record<string, string> = {
  professional: "Profissional", casual: "Casual", educational: "Educacional",
  motivational: "Motivacional", storytelling: "Storytelling", humorous: "Humorístico",
};

export default async function MetricsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [{ data: carousels }, { data: profile }, { data: posts }] = await Promise.all([
    supabase
      .from("carousels")
      .select("id, tone, ai_provider, status, created_at")
      .eq("user_id", user!.id)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true }),

    supabase
      .from("profiles")
      .select("plan, carousels_used_this_month, quota_reset_at")
      .eq("id", user!.id)
      .single(),

    supabase
      .from("social_posts")
      .select("id, platform, status, created_at")
      .eq("user_id", user!.id)
      .gte("created_at", sixMonthsAgo.toISOString()),
  ]);

  const allCarousels = carousels ?? [];
  const allPosts = posts ?? [];

  // Carousels per month (last 6 months)
  const monthlyData: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const count = allCarousels.filter(c => {
      const cd = new Date(c.created_at);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    monthlyData.push({ month: label, count });
  }

  // Tone distribution
  const toneCounts: Record<string, number> = {};
  for (const c of allCarousels) {
    toneCounts[c.tone] = (toneCounts[c.tone] ?? 0) + 1;
  }
  const toneData = Object.entries(toneCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tone, count]) => ({ tone: TONE_LABELS[tone] ?? tone, count }));

  // AI provider distribution
  const providerCounts: Record<string, number> = {};
  for (const c of allCarousels) {
    if (c.ai_provider) providerCounts[c.ai_provider] = (providerCounts[c.ai_provider] ?? 0) + 1;
  }
  const providerData = Object.entries(providerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([provider, count]) => ({ provider, count }));

  // Post status
  const postStatusCounts = {
    published: allPosts.filter(p => p.status === "published").length,
    scheduled: allPosts.filter(p => p.status === "scheduled").length,
    failed: allPosts.filter(p => p.status === "failed").length,
  };

  const planLimit = profile?.plan === "pro" ? 30 : profile?.plan === "business" ? Infinity : 3;
  const used = profile?.carousels_used_this_month ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Métricas</h1>
          <p className="text-white/50 text-sm">Acompanhe seu desempenho e uso da plataforma</p>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Carrosséis (6 meses)"
          value={allCarousels.length}
          color="indigo"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Usados este mês"
          value={`${used}${planLimit !== Infinity ? ` / ${planLimit}` : ""}`}
          color="purple"
        />
        <StatCard
          icon={<Share2 className="h-4 w-4" />}
          label="Posts publicados"
          value={postStatusCounts.published}
          color="green"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Plano atual"
          value={profile?.plan ?? "free"}
          capitalize
          color="yellow"
        />
      </div>

      <MetricsCharts
        monthlyData={monthlyData}
        toneData={toneData}
        providerData={providerData}
        postStatusCounts={postStatusCounts}
      />
    </div>
  );
}

function StatCard({
  icon, label, value, color, capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "indigo" | "purple" | "green" | "yellow";
  capitalize?: boolean;
}) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    purple: "bg-purple-500/10 text-purple-400",
    green: "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className={`text-2xl font-bold text-white ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
