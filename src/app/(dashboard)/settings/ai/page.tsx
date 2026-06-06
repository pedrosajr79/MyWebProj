"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderStatus = "active" | "rate_limited" | "no_key" | "disabled";

interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  envKey: string;
  status: ProviderStatus;
  rateLimitRemainingSeconds: number;
  order: number;
}

interface TestResult {
  success: boolean;
  error?: string;
  response?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status, rateLimitRemaining }: { status: ProviderStatus; rateLimitRemaining: number }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Ativo
        </Badge>
      );
    case "rate_limited":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Rate limit ({rateLimitRemaining}s)
        </Badge>
      );
    case "no_key":
      return (
        <Badge variant="outline" className="gap-1 text-white/40 border-white/10">
          <XCircle className="h-3 w-3" />
          Sem API key
        </Badge>
      );
    case "disabled":
      return (
        <Badge variant="outline" className="gap-1 text-white/30 border-white/10">
          <XCircle className="h-3 w-3" />
          Desativado
        </Badge>
      );
  }
}

function StatusIcon({ status }: { status: ProviderStatus }) {
  switch (status) {
    case "active":
      return <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />;
    case "rate_limited":
      return <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />;
    case "no_key":
      return <div className="h-2 w-2 rounded-full bg-white/20" />;
    case "disabled":
      return <div className="h-2 w-2 rounded-full bg-white/10" />;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AISettingsPage() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/providers");
      if (!res.ok) throw new Error("Falha ao carregar providers");
      const data = await res.json() as { providers: ProviderInfo[] };
      setProviders(data.providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  async function testProvider(providerId: string) {
    setTestingId(providerId);
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });

    try {
      const res = await fetch("/api/ai/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json() as TestResult;
      setTestResults((prev) => ({ ...prev, [providerId]: data }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: { success: false, error: err instanceof Error ? err.message : "Erro de rede" },
      }));
    } finally {
      setTestingId(null);
    }
  }

  // Determine the active (first in order) provider for the chain
  const activeProviders = providers.filter(
    (p) => p.status !== "no_key" && p.status !== "disabled"
  );
  const primaryProvider = activeProviders[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-white/50 hover:text-white hover:bg-white/5"
        >
          <Link href="/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuração de IA</h1>
          <p className="text-white/40 text-sm">
            Multi-provider com fallback automático
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3">
        <Bot className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-sm text-white/70 space-y-1">
          <p>
            O sistema tenta os providers na ordem abaixo. Se um falhar por
            rate limit (429) ou quota esgotada, passa automaticamente para o
            próximo.
          </p>
          <p className="text-white/40 text-xs">
            Configure as API keys via variáveis de ambiente. A ordem pode ser
            ajustada via{" "}
            <code className="font-mono bg-white/5 px-1 rounded">AI_PROVIDER_ORDER</code>{" "}
            e providers desabilitados via{" "}
            <code className="font-mono bg-white/5 px-1 rounded">AI_PROVIDERS_DISABLED</code>.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex items-center justify-center gap-3 text-white/40">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando providers...
        </div>
      )}

      {/* Chain summary */}
      {!loading && activeProviders.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
            Cadeia de fallback ativa
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {activeProviders.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    i === 0 ? "text-green-400" : "text-white/50"
                  }`}
                >
                  {p.name}
                </span>
                {i < activeProviders.length - 1 && (
                  <span className="text-white/20 text-xs">→</span>
                )}
              </div>
            ))}
          </div>
          {primaryProvider && (
            <p className="text-xs text-white/30 mt-2">
              Provider principal:{" "}
              <span className="text-white/60">{primaryProvider.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Provider list */}
      {!loading && providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider, idx) => {
            const testResult = testResults[provider.id];
            const isTesting = testingId === provider.id;
            const isFirst = idx === 0;
            const isLast = idx === providers.length - 1;

            return (
              <div
                key={provider.id}
                className={`rounded-2xl border p-5 transition-colors ${
                  provider.status === "active"
                    ? "border-white/10 bg-white/[0.02]"
                    : provider.status === "rate_limited"
                    ? "border-yellow-500/20 bg-yellow-500/[0.03]"
                    : "border-white/5 bg-white/[0.01] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Order badge */}
                    <div className="flex flex-col gap-1 pt-0.5">
                      <span className="text-xs font-mono text-white/20 text-center">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled
                          title="Reordene via AI_PROVIDER_ORDER"
                          className="text-white/15 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled
                          title="Reordene via AI_PROVIDER_ORDER"
                          className="text-white/15 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusIcon status={provider.status} />
                        <span className="font-semibold text-white text-sm">
                          {provider.name}
                        </span>
                        {isFirst && provider.status === "active" && (
                          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                            Principal
                          </span>
                        )}
                        <StatusBadge
                          status={provider.status}
                          rateLimitRemaining={provider.rateLimitRemainingSeconds}
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {provider.description}
                      </p>
                      <p className="text-xs font-mono text-white/20 mt-1">
                        {provider.envKey}
                      </p>
                    </div>
                  </div>

                  {/* Right: test button */}
                  <div className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        provider.status === "no_key" || isTesting || testingId !== null
                      }
                      onClick={() => void testProvider(provider.id)}
                      className="border-white/10 text-white/70 hover:bg-white/5 text-xs"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Testando…
                        </>
                      ) : (
                        "Testar"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Test result */}
                {testResult && (
                  <div
                    className={`mt-3 rounded-lg px-3 py-2 text-xs flex gap-2 items-start ${
                      testResult.success
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      {testResult.success ? (
                        <span>Conexão bem-sucedida</span>
                      ) : (
                        <span className="break-words">{testResult.error}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No providers message */}
      {!loading && providers.length === 0 && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/40 text-sm">
          Nenhum provider encontrado.
        </div>
      )}

      {/* Env var reference */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Variáveis de ambiente relevantes
        </p>
        <div className="space-y-2 text-xs font-mono">
          {[
            { key: "ANTHROPIC_API_KEY", hint: "Anthropic / Claude" },
            { key: "OPENAI_API_KEY", hint: "OpenAI / GPT" },
            { key: "GROQ_API_KEY", hint: "Groq / Llama — gratuito com limites" },
            { key: "GEMINI_API_KEY", hint: "Google Gemini — gratuito" },
            { key: "COHERE_API_KEY", hint: "Cohere Command R — gratuito" },
            { key: "AI_PROVIDER_ORDER", hint: "ex: groq,gemini,anthropic,openai,cohere" },
            { key: "AI_PROVIDERS_DISABLED", hint: "ex: cohere,openai" },
          ].map(({ key, hint }) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-white/50">{key}</span>
              <span className="text-white/20 text-right">{hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLoading(true);
            void fetchProviders();
          }}
          className="text-white/40 hover:text-white hover:bg-white/5 text-xs"
        >
          Atualizar status
        </Button>
      </div>
    </div>
  );
}
