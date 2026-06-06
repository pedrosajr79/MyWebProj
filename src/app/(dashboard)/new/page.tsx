"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GenerationForm } from "@/components/generation/GenerationForm";
import { CarouselViewer } from "@/components/carousel/CarouselViewer";
import { ExportButton } from "@/components/carousel/ExportButton";
import { Button } from "@/components/ui/button";
import type { SlideData, ThemeConfig } from "@/types/carousel";
import { Save, RefreshCw, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Step = "form" | "preview";

export default function NewCarouselPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [saving, setSaving] = useState(false);

  function handleGenerated(newSlides: SlideData[], newTitle: string, newTheme: ThemeConfig) {
    setSlides(newSlides);
    setTitle(newTitle);
    setTheme(newTheme);
    setStep("preview");
    toast.success("Carrossel gerado com sucesso!");
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
        topic,
        tone: "professional",
        slide_count: slides.length,
        slides,
        theme,
        status: "draft",
      }).select("id").single();

      if (error) throw error;
      toast.success("Carrossel salvo!");
      router.push(`/carousels/${data.id}`);
    } catch (err) {
      toast.error("Erro ao salvar carrossel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Novo carrossel</h1>
        <p className="text-white/50 mt-1">Preencha as informações e a IA cria seu carrossel profissional</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold text-white">Configurar carrossel</h2>
          </div>
          <GenerationForm onGenerated={handleGenerated} />
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Preview</h2>
            {step === "preview" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep("form")} className="border-white/10 text-white hover:bg-white/5">
                  <RefreshCw className="h-3.5 w-3.5" /> Refazer
                </Button>
                <ExportButton slides={slides} theme={theme!} title={title} />
                <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-3.5 w-3.5" /> Salvar
                </Button>
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
                <p className="text-sm text-white/40">{slides.length} slides gerados</p>
              </div>
              <CarouselViewer slides={slides} theme={theme!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
