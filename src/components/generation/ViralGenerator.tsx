"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Zap, Loader2, TrendingUp, Hash, Lightbulb, Search,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideData } from "@/types/carousel";

type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";

const PLATFORMS: { id: Platform; label: string; emoji: string; hashtagLimit: number }[] = [
  { id: "instagram", label: "Instagram", emoji: "📸", hashtagLimit: 5 },
  { id: "facebook", label: "Facebook", emoji: "👥", hashtagLimit: 5 },
  { id: "linkedin", label: "LinkedIn", emoji: "💼", hashtagLimit: 5 },
  { id: "twitter", label: "Twitter/X", emoji: "🐦", hashtagLimit: 2 },
  { id: "tiktok", label: "TikTok", emoji: "🎵", hashtagLimit: 5 },
];

const NICHES = [
  "Marketing Digital", "Empreendedorismo", "Finanças Pessoais", "Saúde e Bem-estar",
  "Moda e Beleza", "Alimentação Saudável", "Tecnologia", "Educação", "Motivação",
  "Imóveis", "Jurídico", "Médico / Saúde",
];

interface ViralResult {
  title: string;
  slides: SlideData[];
  hashtags: string[];
  caption: string;
  viralElements: string[];
  seoTips: string[];
  provider: string;
  searchUsed: boolean;
}

interface Props {
  onApply: (slides: SlideData[], title: string, hashtags: string[], caption: string) => void;
}

export function ViralGenerator({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [slideCount, setSlideCount] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const effectiveNiche = niche === "__custom__" ? customNiche : niche;

  const handleGenerate = async () => {
    if (!effectiveNiche.trim()) {
      toast.error("Selecione ou digite um nicho");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche: effectiveNiche, slideCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar");
      setResult(data);
      toast.success("Conteúdo viral gerado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar conteúdo viral");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.slides, result.title, result.hashtags, result.caption);
    setOpen(false);
    toast.success("Carrossel viral aplicado! Personalize e exporte.");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all w-full"
      >
        <Zap className="h-4 w-4 group-hover:animate-pulse" />
        <span className="font-medium">Modo Viral — Gerar com base em conteúdos que já viralizaram</span>
        <TrendingUp className="h-4 w-4 ml-auto" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20">
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Gerador de Conteúdo Viral</h3>
            <p className="text-xs text-white/40">Pesquisa tendências e cria um carrossel com alto potencial de viralização</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Platform selector */}
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Plataforma alvo</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                platform === p.id
                  ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              <span>{p.emoji}</span>
              {p.label}
              {platform === p.id && (
                <span className="text-[10px] text-indigo-400/70">max {p.hashtagLimit} #</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Niche selector */}
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Nicho / Área de conteúdo</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {NICHES.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs border transition-all",
                niche === n
                  ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
              )}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setNiche("__custom__")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs border transition-all",
              niche === "__custom__"
                ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
            )}
          >
            + Outro
          </button>
        </div>
        {niche === "__custom__" && (
          <Input
            placeholder="Digite o seu nicho..."
            value={customNiche}
            onChange={(e) => setCustomNiche(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-white/30 text-sm"
          />
        )}
      </div>

      {/* Slide count */}
      <div>
        <Label className="text-white/70 text-xs mb-2 block">Número de slides: {slideCount}</Label>
        <input
          type="range"
          min={5}
          max={12}
          value={slideCount}
          onChange={(e) => setSlideCount(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-white/20 mt-1">
          <span>5 (mínimo)</span><span>12 (máximo)</span>
        </div>
      </div>

      {/* Generate button */}
      <Button
        variant="gradient"
        className="w-full"
        onClick={handleGenerate}
        disabled={loading || !effectiveNiche.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Pesquisando tendências e gerando conteúdo...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Pesquisar e Gerar Conteúdo Viral
          </>
        )}
      </Button>

      {loading && (
        <p className="text-center text-xs text-white/30 animate-pulse">
          Analisando conteúdos virais e gerando seu carrossel... pode levar 20-40 segundos.
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          {/* Title & preview */}
          <div>
            <p className="text-xs text-white/40 mb-1">Carrossel gerado</p>
            <h4 className="text-white font-semibold">{result.title}</h4>
            <p className="text-xs text-white/40 mt-1">{result.slides.length} slides • Provider: {result.provider}</p>
            {!result.searchUsed && (
              <p className="text-xs text-yellow-400/70 mt-1">⚠ Busca web não configurada — conteúdo gerado por IA sem dados externos. Configure TAVILY_API_KEY para resultados mais precisos.</p>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="h-3.5 w-3.5 text-indigo-400" />
              <p className="text-xs font-semibold text-indigo-400">Hashtags ({result.hashtags.length}) — otimizadas para {platform}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((h) => (
                <span key={h} className="text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg px-2 py-0.5">
                  #{h}
                </span>
              ))}
            </div>
          </div>

          {/* Caption */}
          {result.caption && (
            <div className="rounded-xl bg-white/5 border border-white/8 p-3">
              <p className="text-xs text-white/40 mb-1 font-semibold">Legenda sugerida</p>
              <p className="text-sm text-white/80 leading-relaxed">{result.caption}</p>
            </div>
          )}

          {/* Details toggle */}
          {(result.viralElements.length > 0 || result.seoTips.length > 0) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showDetails ? "Esconder" : "Ver"} análise viral e dicas de SEO
            </button>
          )}

          {showDetails && (
            <div className="space-y-3">
              {result.viralElements.length > 0 && (
                <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                    <p className="text-xs font-semibold text-green-400">Por que vai viralizar</p>
                  </div>
                  <ul className="space-y-1">
                    {result.viralElements.map((e, i) => (
                      <li key={i} className="text-xs text-white/60">• {e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.seoTips.length > 0 && (
                <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="h-3.5 w-3.5 text-purple-400" />
                    <p className="text-xs font-semibold text-purple-400">Dicas de SEO para {platform}</p>
                  </div>
                  <ul className="space-y-1">
                    {result.seoTips.map((tip, i) => (
                      <li key={i} className="text-xs text-white/60">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Slides preview */}
          <div className="space-y-2">
            <p className="text-xs text-white/40 font-semibold">Prévia dos slides</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {result.slides.map((slide, i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/8 px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{(slide as {emoji?: string}).emoji ?? "📌"}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wide">{(slide as {type?: string}).type ?? "content"}</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{slide.title}</p>
                  <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{slide.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1" onClick={handleApply}>
              <Zap className="h-4 w-4 mr-2" />
              Aplicar este carrossel
            </Button>
            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white" onClick={handleGenerate} disabled={loading}>
              Gerar outro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
