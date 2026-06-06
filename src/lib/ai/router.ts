// ─── AI Provider Interface ────────────────────────────────────────────────────

export interface AIProvider {
  /** Unique identifier (matches env var prefix) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Core generation method */
  generate(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string>;
}

// ─── Provider Registry ────────────────────────────────────────────────────────

/** All supported provider IDs */
export type ProviderId = "anthropic" | "openai" | "groq" | "gemini" | "cohere";

/** Metadata about each provider for UI/status display */
export const PROVIDER_METADATA: Record<ProviderId, { name: string; envKey: string; description: string }> = {
  anthropic: {
    name: "Anthropic (Claude Haiku)",
    envKey: "ANTHROPIC_API_KEY",
    description: "Modelo rápido e barato da Anthropic",
  },
  openai: {
    name: "OpenAI (GPT-4o mini)",
    envKey: "OPENAI_API_KEY",
    description: "Modelo econômico da OpenAI",
  },
  groq: {
    name: "Groq (Llama 3)",
    envKey: "GROQ_API_KEY",
    description: "Inferência ultra-rápida e gratuita com limites generosos",
  },
  gemini: {
    name: "Google Gemini (Flash)",
    envKey: "GEMINI_API_KEY",
    description: "Modelo multimodal gratuito do Google",
  },
  cohere: {
    name: "Cohere (Command R)",
    envKey: "COHERE_API_KEY",
    description: "Modelo gratuito da Cohere",
  },
};

/** Default provider order (can be overridden via AI_PROVIDER_ORDER env var) */
const DEFAULT_ORDER: ProviderId[] = ["anthropic", "openai", "groq", "gemini", "cohere"];

// ─── Rate-limit tracking (in-process cache, resets on cold start) ─────────────

interface RateLimitEntry {
  until: number; // timestamp when the provider can be retried
}

const rateLimitCache = new Map<string, RateLimitEntry>();

/** Mark a provider as rate-limited for a cooldown period */
function markRateLimited(providerId: string, cooldownMs = 60_000) {
  rateLimitCache.set(providerId, { until: Date.now() + cooldownMs });
}

/** Returns true if the provider is currently cooling down */
function isRateLimited(providerId: string): boolean {
  const entry = rateLimitCache.get(providerId);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    rateLimitCache.delete(providerId);
    return false;
  }
  return true;
}

/** Returns how many seconds remain on the cooldown (0 if not limited) */
export function getRateLimitRemaining(providerId: string): number {
  const entry = rateLimitCache.get(providerId);
  if (!entry) return 0;
  const remaining = Math.ceil((entry.until - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the priority order from env or use default */
function getProviderOrder(): ProviderId[] {
  const envOrder = process.env.AI_PROVIDER_ORDER;
  if (envOrder) {
    const parsed = envOrder.split(",").map((s) => s.trim()) as ProviderId[];
    // Filter to valid IDs only
    return parsed.filter((id) => id in PROVIDER_METADATA);
  }
  return DEFAULT_ORDER;
}

/** Parse the disabled providers list from env */
function getDisabledProviders(): Set<string> {
  const envDisabled = process.env.AI_PROVIDERS_DISABLED ?? "";
  return new Set(envDisabled.split(",").map((s) => s.trim()).filter(Boolean));
}

/** Whether a provider has its API key configured */
export function isProviderConfigured(providerId: ProviderId): boolean {
  const meta = PROVIDER_METADATA[providerId];
  return Boolean(process.env[meta.envKey]);
}

/** Returns true if the HTTP status suggests a rate-limit / quota error */
function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status;
    if (status === 429) return true;
    // Some providers surface quota exhaustion as 503 or with specific messages
    const msg = err.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("quota") || msg.includes("too many requests")) {
      return true;
    }
  }
  return false;
}

/** Lazy-load a provider module */
async function loadProvider(id: ProviderId): Promise<AIProvider> {
  switch (id) {
    case "anthropic": {
      const { anthropicProvider } = await import("./providers/anthropic");
      return anthropicProvider;
    }
    case "openai": {
      const { openaiProvider } = await import("./providers/openai");
      return openaiProvider;
    }
    case "groq": {
      const { groqProvider } = await import("./providers/groq");
      return groqProvider;
    }
    case "gemini": {
      const { geminiProvider } = await import("./providers/gemini");
      return geminiProvider;
    }
    case "cohere": {
      const { cohereProvider } = await import("./providers/cohere");
      return cohereProvider;
    }
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

const MAX_PROVIDER_ATTEMPTS = 3;

export interface RouterResult {
  text: string;
  providerId: string;
  providerName: string;
  attemptCount: number;
}

/**
 * Tries providers in order of preference.
 * On rate-limit / quota errors, marks the provider as temporarily unavailable
 * and moves to the next one. Throws if all providers fail or max attempts reached.
 */
export async function routeGenerate(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<RouterResult> {
  const order = getProviderOrder();
  const disabled = getDisabledProviders();

  const candidates = order.filter(
    (id) => !disabled.has(id) && isProviderConfigured(id) && !isRateLimited(id)
  );

  if (candidates.length === 0) {
    throw new Error(
      "Nenhum provider de IA disponível. " +
        "Verifique se as API keys estão configuradas ou se não estão todas em rate-limit."
    );
  }

  const attempts = Math.min(candidates.length, MAX_PROVIDER_ATTEMPTS);
  const errors: string[] = [];

  for (let i = 0; i < attempts; i++) {
    const providerId = candidates[i];
    try {
      const provider = await loadProvider(providerId);
      const text = await provider.generate(systemPrompt, userPrompt, maxTokens);
      return {
        text,
        providerId,
        providerName: provider.name,
        attemptCount: i + 1,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      if (isRateLimitError(err)) {
        console.warn(`[AI Router] Provider "${providerId}" hit rate limit. Trying next.`);
        markRateLimited(providerId);
      } else {
        console.error(`[AI Router] Provider "${providerId}" failed: ${msg}`);
      }

      errors.push(`${providerId}: ${msg}`);
    }
  }

  throw new Error(
    `Todos os providers de IA falharam após ${attempts} tentativas.\n${errors.join("\n")}`
  );
}

// ─── Status Helpers (for settings page) ──────────────────────────────────────

export type ProviderStatus = "active" | "rate_limited" | "no_key" | "disabled";

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  description: string;
  envKey: string;
  status: ProviderStatus;
  rateLimitRemainingSeconds: number;
  order: number;
}

/** Returns full status info for all providers (server-side only) */
export function getProviderStatuses(): ProviderInfo[] {
  const order = getProviderOrder();
  const disabled = getDisabledProviders();

  return Object.entries(PROVIDER_METADATA).map(([id, meta]) => {
    const pid = id as ProviderId;
    const orderIndex = order.indexOf(pid);
    const rateLimitRemaining = getRateLimitRemaining(pid);

    let status: ProviderStatus;
    if (disabled.has(pid)) {
      status = "disabled";
    } else if (!isProviderConfigured(pid)) {
      status = "no_key";
    } else if (rateLimitRemaining > 0) {
      status = "rate_limited";
    } else {
      status = "active";
    }

    return {
      id: pid,
      name: meta.name,
      description: meta.description,
      envKey: meta.envKey,
      status,
      rateLimitRemainingSeconds: rateLimitRemaining,
      order: orderIndex >= 0 ? orderIndex : order.length,
    };
  }).sort((a, b) => a.order - b.order);
}
