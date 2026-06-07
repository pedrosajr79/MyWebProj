"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureSuggestion {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  effort: "easy" | "medium" | "complex";
  impact: string;
  risk: string;
  verdict: string;
  verdictReason: string;
  techStack: string[];
}

interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  keyFeatures: string[];
}

interface ResearchResult {
  competitorAnalysis: Competitor[];
  featureSuggestions: FeatureSuggestion[];
  marketTrends: string[];
  securityRecommendations: string[];
  summary: string;
}

interface ResearchRecord {
  id: string;
  triggered_by: string;
  status: "pending" | "done" | "error";
  created_at: string;
  result: ResearchResult | { error: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<
  "high" | "medium" | "low",
  { label: string; badge: string }
> = {
  high: { label: "Alta", badge: "bg-red-700/30 border border-red-700/50 text-red-400" },
  medium: { label: "Média", badge: "bg-amber-700/30 border border-amber-700/50 text-amber-400" },
  low: { label: "Baixa", badge: "bg-zinc-700/30 border border-zinc-600/50 text-zinc-400" },
};

const effortConfig: Record<
  "easy" | "medium" | "complex",
  { label: string; badge: string }
> = {
  easy: { label: "Fácil", badge: "bg-emerald-700/30 border border-emerald-700/50 text-emerald-400" },
  medium: { label: "Médio", badge: "bg-blue-700/30 border border-blue-700/50 text-blue-400" },
  complex: { label: "Complexo", badge: "bg-purple-700/30 border border-purple-700/50 text-purple-400" },
};

const verdictConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Aprovado": { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-400" },
  "Aprovado com ressalvas": { icon: <AlertCircle className="h-4 w-4" />, color: "text-amber-400" },
  "Não recomendado agora": { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-400" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isResearchResult(r: unknown): r is ResearchResult {
  return (
    typeof r === "object" &&
    r !== null &&
    "featureSuggestions" in r &&
    Array.isArray((r as ResearchResult).featureSuggestions)
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: FeatureSuggestion }) {
  const [expanded, setExpanded] = useState(false);
  const pri = priorityConfig[feature.priority] ?? priorityConfig.low;
  const eff = effortConfig[feature.effort] ?? effortConfig.medium;
  const vrd = verdictConfig[feature.verdict] ?? verdictConfig["Aprovado com ressalvas"];

  return (
    <div className="rounded-xl border border-red-900/20 bg-[#130b0b] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-5 flex flex-col gap-3"
      >
        <div className="flex flex-wrap items-start gap-2">
          <span className={cn("text-[11px] font-semibold rounded-full px-2 py-0.5", pri.badge)}>
            {pri.label}
          </span>
          <span className={cn("text-[11px] font-semibold rounded-full px-2 py-0.5", eff.badge)}>
            {eff.label}
          </span>
          <span className={cn("ml-auto flex items-center gap-1 text-xs font-semibold", vrd.color)}>
            {vrd.icon}
            {feature.verdict}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{feature.name}</h3>
          <p className="text-xs text-white/50 mt-1 line-clamp-2">{feature.description}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-red-900/10 pt-4">
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Descrição</p>
            <p className="text-sm text-white/70">{feature.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Impacto</p>
              <p className="text-sm text-white/70">{feature.impact}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Risco</p>
              <p className="text-sm text-white/70">{feature.risk}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">Veredicto do Engenheiro</p>
            <p className={cn("text-sm font-medium", vrd.color)}>{feature.verdictReason}</p>
          </div>
          {feature.techStack?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {feature.techStack.map((t) => (
                  <span key={t} className="text-[11px] rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-white/60">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HistoryItem({
  record,
  onLoad,
}: {
  record: ResearchRecord;
  onLoad: (r: ResearchResult) => void;
}) {
  const statusIcons: Record<string, React.ReactNode> = {
    done: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    pending: <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />,
    error: <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-900/15 bg-[#130b0b] px-4 py-3">
      <div className="shrink-0">{statusIcons[record.status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/60 truncate">{formatDate(record.created_at)}</p>
        {record.status === "error" && (
          <p className="text-xs text-red-400 truncate">Erro na geração</p>
        )}
      </div>
      {record.status === "done" && isResearchResult(record.result) && (
        <button
          onClick={() => onLoad(record.result as ResearchResult)}
          className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Carregar
        </button>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function UpdatesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [history, setHistory] = useState<ResearchRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load history on mount
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/research");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.records ?? []);
      }
    } catch {
      // silently ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleResearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/research", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      if (isResearchResult(data.result)) {
        setResult(data.result);
        await fetchHistory();
      } else {
        throw new Error("Resposta da IA não tem o formato esperado");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Central de Atualizações</h1>
          <p className="text-sm text-white/40 mt-1">
            Análise de mercado e sugestões de features geradas por IA
          </p>
        </div>
        <button
          onClick={handleResearch}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
            loading
              ? "bg-red-900/30 text-red-400/50 cursor-not-allowed"
              : "bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/30"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Pesquisando... (pode levar 30-60s)
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Pesquisar Atualizações
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-700/40 bg-red-900/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Erro na pesquisa</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border border-red-900/20 bg-[#130b0b] p-10 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-red-400 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-white">A IA está analisando o mercado...</p>
            <p className="text-xs text-white/40 mt-1">
              Isso pode levar entre 30 e 60 segundos. Aguarde.
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="rounded-xl border border-red-900/20 bg-[#130b0b] p-6">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
              Resumo Executivo
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">{result.summary}</p>
          </div>

          {/* Feature suggestions */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Sugestões de Features
              <span className="ml-2 text-sm font-normal text-white/40">
                ({result.featureSuggestions?.length ?? 0} encontradas)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.featureSuggestions?.map((f) => (
                <FeatureCard key={f.id} feature={f} />
              ))}
            </div>
          </div>

          {/* Market trends */}
          {result.marketTrends?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Tendências de Mercado</h2>
              <div className="rounded-xl border border-red-900/20 bg-[#130b0b] p-5">
                <ul className="space-y-2">
                  {result.marketTrends.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Security recommendations */}
          {result.securityRecommendations?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Recomendações de Segurança</h2>
              <div className="rounded-xl border border-red-900/20 bg-[#130b0b] p-5">
                <ul className="space-y-2">
                  {result.securityRecommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Competitor analysis */}
          {result.competitorAnalysis?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Análise de Concorrentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.competitorAnalysis.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-red-900/20 bg-[#130b0b] p-5 space-y-3"
                  >
                    <div>
                      <h3 className="font-semibold text-white">{c.name}</h3>
                      <p className="text-xs text-white/50 mt-0.5">{c.description}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-400/70 uppercase tracking-wider mb-1">
                        Pontos Fortes
                      </p>
                      <ul className="space-y-0.5">
                        {c.strengths?.map((s, i) => (
                          <li key={i} className="text-xs text-white/60 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-red-400/70 uppercase tracking-wider mb-1">
                        Fraquezas
                      </p>
                      <ul className="space-y-0.5">
                        {c.weaknesses?.map((w, i) => (
                          <li key={i} className="text-xs text-white/60 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-red-500 shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-white">Histórico de Pesquisas</h2>
          <button
            onClick={fetchHistory}
            className="ml-auto text-white/30 hover:text-white/70 transition-colors"
            title="Atualizar histórico"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {historyLoading ? (
          <div className="flex items-center gap-2 text-sm text-white/40 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando histórico...
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-white/40 py-4">
            <Clock className="h-4 w-4" />
            Nenhuma pesquisa realizada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((rec) => (
              <HistoryItem
                key={rec.id}
                record={rec}
                onLoad={(r) => setResult(r)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
