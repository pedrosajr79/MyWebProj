"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GenerationForm } from "@/components/generation/GenerationForm";
import { CarouselViewer } from "@/components/carousel/CarouselViewer";
import { ExportButton } from "@/components/carousel/ExportButton";
import { CarouselReviewPanel } from "@/components/review/CarouselReviewPanel";
import { Button } from "@/components/ui/button";
import { useCarouselReview } from "@/hooks/useCarouselReview";
import type { SlideData, ThemeConfig, GenerationMeta } from "@/types/carousel";
import { Save, RefreshCw, Sparkles, ClipboardCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ViralGenerator } from "@/components/generation/ViralGenerator";

type Step = "form" | "preview" | "review" | "done";

export default function NewCarouselPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [rawSlides, setRawSlides] = useState<SlideData[]>([]);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState<GenerationMeta>({ topic: "", tone: "professional", niche: "marketing" });
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    review,
    status: reviewStatus,
    slides: reviewedSlides,
    startReview,
    acceptSuggestion,
    rejectSuggestion,
    applyAll,
    isAllDecided,
    isApproved,
  } = useCarouselReview(rawSlides);

  // Final slides: after review, use reviewedSlides; before, use rawSlides
  const finalSlides = step === "done" || step === "review" ? reviewedSlides : rawSlides;

  function handleViralApply(slides: import("@/types/carousel").SlideData[], viralTitle: string, hashtags: string[], _caption: string) {
    setRawSlides(slides);
    setTitle(viralTitle);
    setMeta({ topic: viralTitle, tone: "casual", niche: "marketing" });
    // Store hashtags for the publish flow (saved in state; user can edit in publish page)
    sessionStorage.setItem("viral_hashtags", JSON.stringify(hashtags));
    setStep("preview");
    toast.success("Modo Viral ativado! Revise o preview e personalize o tema.");
  }

  function handleGenerated(newSlides: SlideData[], newTitle: string, newTheme: ThemeConfig, newMeta: GenerationMeta) {
    setRawSlides(newSlides);
    setTitle(newTitle);
    setTheme(newTheme);
    setMeta(newMeta);
    setStep("preview");
    toast.success("Carrossel gerado! Revise o preview abaixo.");
  }

  async function handleStartReview() {
    setStep("review");
    await startReview(rawSlides, meta);
  }

  function handleReviewContinue() {
    setStep("done");
    toast.success("Carrossel aprovado! Agora você pode baixar ou salvar.");
  }

  async function handleSave() {
    if (!theme) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Você precisa estar logado"); return; }

      const { data, error } = await supabase.from("carousels").insert({
        user_id: user.id,
        title,
        topic: meta.topic,
        tone: meta.tone,
        slide_count: finalSlides.length,
        slides: finalSlides,
        theme,
        status: "draft",
        ai_provider: process.env.AI_PROVIDER ?? "openai",
      }).select("id").single();

      if (error) throw error;
      toast.success("Carrossel salvo!");
      router.push(`/carousels/${data.id}`);
    } catch {
      toast.error("Erro ao salvar carrossel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Novo carrossel</h1>
          <p className="text-white/50 mt-1">Preencha, gere, revise com IA e exporte pronto para postar</p>
        </div>
        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          {(["form", "preview", "review", "done"] as Step[]).map((s, i) => {
            const labels: Record<Step, string> = { form: "Configurar", preview: "Preview", review: "Revisar", done: "Exportar" };
            const past = ["form", "preview", "review", "done"].indexOf(step) > i;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${active ? "bg-indigo-500 text-white" : past ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/30"}`}>
                  {past ? "✓" : i + 1}
                </div>
                <span className={active ? "text-white font-medium" : past ? "text-green-400" : "text-white/30"}>{labels[s]}</span>
                {i < 3 && <span className="text-white/20">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-col grid: form + preview */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-white">Configurar carrossel</h2>
          </div>
          <div className="mb-5">
            <ViralGenerator onApply={handleViralApply} />
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-white/8" />
            <span className="text-xs text-white/25">ou crie manualmente</span>
            <div className="flex-1 border-t border-white/8" />
          </div>
          <GenerationForm onGenerated={handleGenerated} />
        </div>

        {/* Right: preview */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Preview</h2>
            {(step === "preview" || step === "done") && (
              <div className="flex gap-2 flex-wrap justify-end">
                <Button variant="outline" size="sm" onClick={() => setStep("form")} className="border-white/10 text-white hover:bg-white/5">
                  <RefreshCw className="h-3.5 w-3.5" /> Refazer
                </Button>

                {/* Review button — shows only before done */}
                {step === "preview" && (
                  <Button size="sm" onClick={handleStartReview} className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/20">
                    <ClipboardCheck className="h-3.5 w-3.5" /> Revisar com IA
                  </Button>
                )}

                {/* Export and save — only after review is done */}
                {step === "done" && (
                  <>
                    <ExportButton slides={finalSlides} theme={theme!} title={title} />
                    <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
                      <Save className="h-3.5 w-3.5" /> Salvar
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {step === "form" ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-indigo-400/50" />
              </div>
              <p className="text-white/30 text-sm">Preencha o formulário e clique em<br /><strong className="text-white/50">"Gerar carrossel com IA"</strong></p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-white truncate">{title}</h3>
                <p className="text-sm text-white/40">{finalSlides.length} slides · {meta.topic}</p>
              </div>
              <CarouselViewer slides={finalSlides} theme={theme!} />

              {step === "preview" && (
                <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center">
                  <p className="text-sm text-purple-300/80 mb-3">
                    Antes de publicar, a IA vai analisar cada slide e sugerir melhorias de copy, clareza e engajamento.
                  </p>
                  <Button onClick={handleStartReview} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                    <ClipboardCheck className="h-4 w-4" /> Revisar carrossel com IA
                  </Button>
                </div>
              )}

              {step === "done" && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                  <p className="text-sm text-green-300/80">
                    ✅ Carrossel aprovado e pronto para exportar ou publicar!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review panel — full width below the grid */}
      {step === "review" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20">
              <ClipboardCheck className="h-4 w-4 text-purple-400" />
            </div>
            <h2 className="font-semibold text-white">Revisão com IA</h2>
            {reviewStatus === "loading" && <Loader2 className="h-4 w-4 text-white/40 animate-spin ml-1" />}
          </div>

          {reviewStatus === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
              <p className="text-white/50">A IA está analisando seu carrossel...</p>
              <p className="text-white/30 text-sm">Avaliando clareza, persuasão e engajamento de cada slide</p>
            </div>
          )}

          {reviewStatus === "error" && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Erro ao revisar. Tente novamente.</p>
              <Button onClick={() => startReview(rawSlides, meta)} variant="outline" className="border-white/10 text-white">
                Tentar novamente
              </Button>
            </div>
          )}

          {reviewStatus === "done" && review && (
            <CarouselReviewPanel
              review={review}
              slides={reviewedSlides}
              onAccept={acceptSuggestion}
              onReject={rejectSuggestion}
              onApplyAll={applyAll}
              onContinue={handleReviewContinue}
              isAllDecided={isAllDecided}
            />
          )}
        </div>
      )}
    </div>
  );
}
