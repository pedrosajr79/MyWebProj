import { createClient } from "@/lib/supabase/server";
import { reviewCarouselWithAI } from "@/lib/ai";
import { NextResponse } from "next/server";
import type { SlideData, SlideReview, CarouselReview } from "@/types/carousel";

function calcVerdict(slideReviews: SlideReview[]): Pick<CarouselReview, "overallScore" | "verdict" | "verdictReason"> {
  const scores = slideReviews.map(r => r.overallScore);
  const overall = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const weakSlides = slideReviews.filter(r => r.overallScore < 5).length;
  const approved = overall >= 7 && weakSlides === 0;

  let reason = "";
  if (approved) {
    reason = overall >= 9 ? "Carrossel excelente! Pronto para publicar." : "Bom conteúdo com pequenos pontos de atenção.";
  } else if (weakSlides > 0) {
    reason = `${weakSlides} slide${weakSlides > 1 ? "s" : ""} com pontuação baixa precisam de atenção.`;
  } else {
    reason = `Nota geral ${overall}/10 — revise as sugestões para melhorar o engajamento.`;
  }

  return { overallScore: overall, verdict: approved ? "approved" : "needs_revision", verdictReason: reason };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body: { slides: SlideData[]; topic: string; tone: string; niche: string } = await req.json();
    if (!body.slides?.length) return NextResponse.json({ error: "Slides obrigatórios" }, { status: 400 });

    const raw = await reviewCarouselWithAI(body.slides, {
      topic: body.topic,
      tone: body.tone,
      niche: body.niche,
    });

    let parsed: { slideReviews: Omit<SlideReview, "accepted" | "overallScore">[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Erro ao processar revisão da IA." }, { status: 500 });
    }

    if (!Array.isArray(parsed.slideReviews)) {
      return NextResponse.json({ error: "Resposta inválida da IA." }, { status: 500 });
    }

    // Inject overallScore and accepted:null into each SlideReview
    const slideReviews: SlideReview[] = parsed.slideReviews.map(r => ({
      ...r,
      overallScore: Math.round(((r.scores.clarity + r.scores.persuasion + r.scores.engagement) / 3) * 10) / 10,
      accepted: null,
    }));

    const verdictData = calcVerdict(slideReviews);
    const review: CarouselReview = { ...verdictData, slideReviews };

    return NextResponse.json({ review });
  } catch (err: unknown) {
    console.error("[AI Review]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro interno" }, { status: 500 });
  }
}
