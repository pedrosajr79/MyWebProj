import { createClient } from "@/lib/supabase/server";
import { routeGenerate } from "@/lib/ai/router";
import { VIRAL_SYSTEM_PROMPT, buildViralPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";

type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilyResponse {
  results: TavilyResult[];
  answer?: string;
}

const PLATFORM_SEARCH_SUFFIX: Record<Platform, string> = {
  instagram: "instagram carrossel viral engajamento",
  facebook: "facebook post viral compartilhamento",
  linkedin: "linkedin artigo viral profissional",
  twitter: "twitter thread viral engajamento",
  tiktok: "tiktok tendência viral views",
};

async function searchTrending(niche: string, platform: Platform): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  const suffix = PLATFORM_SEARCH_SUFFIX[platform] ?? "viral conteúdo";
  const query = `${niche} ${suffix} Brasil 2025 melhores exemplos`;

  if (!apiKey) {
    // Fallback: descreve o nicho sem busca externa
    return `Conteúdo no nicho "${niche}" para ${platform}. Crie com base no seu conhecimento sobre o que viraliza neste nicho.`;
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        query,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true,
        topic: "news",
        days: 30,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.warn("[viral/search] Tavily erro:", res.status);
      return `Nicho: ${niche} para ${platform}. Sem resultados da busca — gere com base no seu conhecimento.`;
    }

    const data: TavilyResponse = await res.json();
    const results = data.results?.slice(0, 4) ?? [];

    if (results.length === 0) {
      return data.answer ?? `Nicho: ${niche} — sem resultados recentes encontrados.`;
    }

    const context = results
      .map((r, i) =>
        `[${i + 1}] ${r.title}\n${r.content.slice(0, 300)}...`
      )
      .join("\n\n");

    return data.answer ? `RESUMO DA BUSCA: ${data.answer}\n\nARTIGOS:\n${context}` : context;
  } catch (err) {
    console.warn("[viral/search] Erro na busca:", err);
    return `Nicho: ${niche} para ${platform}. Gere com base no seu conhecimento sobre tendências virais.`;
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const {
      platform,
      niche,
      slideCount = 7,
    } = (await req.json()) as {
      platform: Platform;
      niche: string;
      slideCount?: number;
    };

    if (!platform || !niche?.trim()) {
      return NextResponse.json({ error: "Plataforma e nicho são obrigatórios" }, { status: 400 });
    }

    const validPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "twitter", "tiktok"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Plataforma inválida" }, { status: 400 });
    }

    // Buscar conteúdo trending
    const trendingContent = await searchTrending(niche, platform);

    // Gerar carrossel viral
    const prompt = buildViralPrompt({
      platform,
      niche,
      trendingContent,
      slideCount: Math.min(Math.max(slideCount, 5), 15),
    });

    const result = await routeGenerate(VIRAL_SYSTEM_PROMPT, prompt, 3000);

    let parsed: {
      title: string;
      slides: unknown[];
      hashtags: string[];
      caption: string;
      viralElements: string[];
      seoTips: string[];
    };

    try {
      parsed = JSON.parse(result.text);
    } catch {
      return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 });
    }

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      return NextResponse.json({ error: "Resposta inválida da IA." }, { status: 500 });
    }

    // Garantir máximo de hashtags por plataforma
    const maxHashtags: Record<Platform, number> = {
      instagram: 5, facebook: 5, linkedin: 5, twitter: 2, tiktok: 5,
    };
    const hashtags = (parsed.hashtags ?? [])
      .slice(0, maxHashtags[platform])
      .map((h: string) => h.replace(/^#/, ""));

    return NextResponse.json({
      title: parsed.title ?? niche,
      slides: parsed.slides,
      hashtags,
      caption: parsed.caption ?? "",
      viralElements: parsed.viralElements ?? [],
      seoTips: parsed.seoTips ?? [],
      provider: result.providerId,
      searchUsed: !!process.env.TAVILY_API_KEY,
    });
  } catch (err: unknown) {
    console.error("[viral]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
