import { createClient } from "@/lib/supabase/server";
import { generateCarouselWithAI } from "@/lib/ai";
import { NextResponse } from "next/server";
import type { GenerationRequest } from "@/types/carousel";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body: GenerationRequest = await req.json();
    if (!body.topic?.trim()) return NextResponse.json({ error: "Tema obrigatório" }, { status: 400 });

    // Check quota
    const { data: profile } = await supabase.from("profiles").select("plan, carousels_used_this_month, quota_reset_at").eq("id", user.id).single();
    if (profile) {
      const limits: Record<string, number> = { free: 3, pro: 30, business: -1 };
      const limit = limits[profile.plan ?? "free"];
      const resetDate = new Date(profile.quota_reset_at ?? 0);
      const used = resetDate < new Date() ? 0 : (profile.carousels_used_this_month ?? 0);
      if (limit !== -1 && used >= limit) {
        return NextResponse.json({ error: "Limite mensal atingido. Faça upgrade para continuar." }, { status: 402 });
      }
    }

    const raw = await generateCarouselWithAI(body);

    let parsed: { title: string; slides: unknown[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Erro ao processar resposta da IA. Tente novamente." }, { status: 500 });
    }

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      return NextResponse.json({ error: "Resposta inválida da IA. Tente novamente." }, { status: 500 });
    }

    return NextResponse.json({ title: parsed.title ?? body.topic, slides: parsed.slides });
  } catch (err: unknown) {
    console.error("[AI Generate]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
