"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { THEMES, TONES, NICHES } from "@/types/carousel";
import type { GenerationRequest, ThemeConfig, SlideData, GenerationMeta } from "@/types/carousel";
import { Sparkles, Check } from "lucide-react";

interface Props {
  onGenerated: (slides: SlideData[], title: string, theme: ThemeConfig, meta: GenerationMeta) => void;
}

export function GenerationForm({ onGenerated }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [form, setForm] = useState<GenerationRequest>({
    topic: "",
    niche: "marketing",
    tone: "professional",
    slideCount: 7,
    themeId: THEMES[0].id,
    cta: "",
    targetAudience: "",
  });

  function set(key: keyof GenerationRequest, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) { toast.error("Digite o tema do carrossel"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, themeId: selectedTheme.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao gerar carrossel");
      }
      const data = await res.json();
      onGenerated(data.slides, data.title, selectedTheme, { topic: form.topic, tone: form.tone, niche: form.niche });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
      {/* Topic */}
      <div>
        <Label className="text-white/70 mb-1.5 block">Tema do carrossel *</Label>
        <Textarea
          placeholder="Ex: 5 erros que todo empreendedor comete no início..."
          value={form.topic}
          onChange={e => set("topic", e.target.value)}
          rows={3}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Niche */}
        <div>
          <Label className="text-white/70 mb-1.5 block">Nicho</Label>
          <select
            value={form.niche}
            onChange={e => set("niche", e.target.value)}
            className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {NICHES.map(n => <option key={n.value} value={n.value} className="bg-[#1a1a2e]">{n.label}</option>)}
          </select>
        </div>

        {/* Tone */}
        <div>
          <Label className="text-white/70 mb-1.5 block">Tom</Label>
          <select
            value={form.tone}
            onChange={e => set("tone", e.target.value)}
            className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TONES.map(t => <option key={t.value} value={t.value} className="bg-[#1a1a2e]">{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Slides count */}
      <div>
        <Label className="text-white/70 mb-1.5 block">Quantidade de slides: <strong className="text-white">{form.slideCount}</strong></Label>
        <input
          type="range" min={5} max={15} step={1}
          value={form.slideCount}
          onChange={e => set("slideCount", Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>5</span><span>10</span><span>15</span>
        </div>
      </div>

      {/* Target audience */}
      <div>
        <Label className="text-white/70 mb-1.5 block">Público-alvo <span className="text-white/30">(opcional)</span></Label>
        <Input
          placeholder="Ex: Empreendedores iniciantes, 25-40 anos..."
          value={form.targetAudience}
          onChange={e => set("targetAudience", e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
        />
      </div>

      {/* CTA */}
      <div>
        <Label className="text-white/70 mb-1.5 block">Call-to-action <span className="text-white/30">(opcional)</span></Label>
        <Input
          placeholder="Ex: Siga para mais dicas, Comente sua dúvida..."
          value={form.cta}
          onChange={e => set("cta", e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
        />
      </div>

      {/* Theme selector */}
      <div>
        <Label className="text-white/70 mb-3 block">Tema visual</Label>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme)}
              className={`relative rounded-xl p-3 border transition-all ${selectedTheme.id === theme.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-white/10 hover:border-white/20"}`}
              style={{ background: `linear-gradient(135deg, ${theme.bgColor}, ${theme.primaryColor}20)` }}
            >
              {selectedTheme.id === theme.id && (
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              <div className="h-3 w-3 rounded-full mb-2" style={{ background: theme.primaryColor }} />
              <p className="text-xs font-medium text-left leading-tight" style={{ color: theme.textColor }}>{theme.name}</p>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" variant="gradient" size="lg" className="w-full" loading={loading}>
        <Sparkles className="h-5 w-5" />
        {loading ? "Gerando carrossel..." : "Gerar carrossel com IA"}
      </Button>
    </form>
  );
}
