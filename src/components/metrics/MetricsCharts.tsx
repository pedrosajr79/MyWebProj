"use client";

import { cn } from "@/lib/utils";

interface MonthlyData { month: string; count: number }
interface ToneData { tone: string; count: number }
interface ProviderData { provider: string; count: number }

interface Props {
  monthlyData: MonthlyData[];
  toneData: ToneData[];
  providerData: ProviderData[];
  postStatusCounts: { published: number; scheduled: number; failed: number };
}

function BarChart({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map(({ label, value }) => {
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-white/60">{value > 0 ? value : ""}</span>
            <div className="w-full rounded-t-md bg-white/5 flex items-end" style={{ height: "80px" }}>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500"
                style={{ height: `${pct}%`, minHeight: value > 0 ? "4px" : "0" }}
              />
            </div>
            <span className="text-[10px] text-white/30 text-center leading-tight">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-white w-6 text-right">{value}</span>
    </div>
  );
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-indigo-500",
  openai: "bg-green-500",
  groq: "bg-orange-500",
  gemini: "bg-blue-500",
  cohere: "bg-purple-500",
};

export function MetricsCharts({ monthlyData, toneData, providerData, postStatusCounts }: Props) {
  const maxMonthly = Math.max(...monthlyData.map(d => d.count), 1);
  const maxTone = Math.max(...toneData.map(d => d.count), 1);
  const maxProvider = Math.max(...providerData.map(d => d.count), 1);
  const totalPosts = postStatusCounts.published + postStatusCounts.scheduled + postStatusCounts.failed;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Carrosséis por mês</h3>
        <BarChart
          data={monthlyData.map(d => ({ label: d.month, value: d.count }))}
          maxValue={maxMonthly}
        />
      </div>

      {/* Tone distribution */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Tom mais usado</h3>
        {toneData.length === 0 ? (
          <p className="text-xs text-white/30">Nenhum carrossel ainda</p>
        ) : (
          <div className="space-y-3">
            {toneData.map(({ tone, count }) => (
              <HBar key={tone} label={tone} value={count} max={maxTone} color="bg-indigo-500" />
            ))}
          </div>
        )}
      </div>

      {/* AI providers */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Provider de IA utilizado</h3>
        {providerData.length === 0 ? (
          <p className="text-xs text-white/30">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-3">
            {providerData.map(({ provider, count }) => (
              <HBar
                key={provider}
                label={provider}
                value={count}
                max={maxProvider}
                color={PROVIDER_COLORS[provider] ?? "bg-white/40"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post status */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Status dos posts (6 meses)</h3>
        {totalPosts === 0 ? (
          <p className="text-xs text-white/30">Nenhum post ainda</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 h-6 rounded-full overflow-hidden">
              {postStatusCounts.published > 0 && (
                <div className="bg-green-500 transition-all" style={{ width: `${(postStatusCounts.published / totalPosts) * 100}%` }} />
              )}
              {postStatusCounts.scheduled > 0 && (
                <div className="bg-yellow-500 transition-all" style={{ width: `${(postStatusCounts.scheduled / totalPosts) * 100}%` }} />
              )}
              {postStatusCounts.failed > 0 && (
                <div className="bg-red-500 transition-all" style={{ width: `${(postStatusCounts.failed / totalPosts) * 100}%` }} />
              )}
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-white/50"><span className="h-2 w-2 rounded-full bg-green-500" />Publicados</dt>
                <dd className="text-white font-semibold">{postStatusCounts.published}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-white/50"><span className="h-2 w-2 rounded-full bg-yellow-500" />Agendados</dt>
                <dd className="text-white font-semibold">{postStatusCounts.scheduled}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-2 text-white/50"><span className="h-2 w-2 rounded-full bg-red-500" />Falhou</dt>
                <dd className="text-white font-semibold">{postStatusCounts.failed}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
