"use client";
import { AlertTriangle, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SlideReview, SlideData, SlideIssueType } from "@/types/carousel";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ISSUE_LABELS: Record<SlideIssueType, string> = {
  weak_title: "Título fraco",
  body_too_long: "Corpo muito longo",
  generic_cta: "CTA genérico",
  low_clarity: "Pouca clareza",
  missing_hook: "Sem gancho",
  no_value: "Sem valor entregue",
  off_topic: "Fora do tema",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "bg-green-500" : value >= 5 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-20 text-white/50 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="w-5 text-right font-semibold" style={{ color: value >= 7 ? "#4ade80" : value >= 5 ? "#fbbf24" : "#f87171" }}>{value}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 7) return <Badge variant="success">{score}/10</Badge>;
  if (score >= 5) return <Badge variant="warning">{score}/10</Badge>;
  return <Badge variant="destructive">{score}/10</Badge>;
}

interface Props {
  slideReview: SlideReview;
  slide: SlideData;
  onAccept: () => void;
  onReject: () => void;
}

export function SlideReviewCard({ slideReview, slide, onAccept, onReject }: Props) {
  const [expanded, setExpanded] = useState(slideReview.overallScore < 7);

  const typeLabels: Record<string, string> = { cover: "Capa", content: "Conteúdo", cta: "CTA" };

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      slideReview.accepted === true ? "border-green-500/30 bg-green-500/5" :
      slideReview.accepted === false ? "border-white/10 bg-white/[0.02] opacity-60" :
      slideReview.overallScore < 5 ? "border-red-500/20 bg-red-500/5" :
      slideReview.overallScore < 7 ? "border-yellow-500/20 bg-yellow-500/5" :
      "border-white/10 bg-white/[0.02]"
    )}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white shrink-0">
          {slideReview.slideIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-white/40 uppercase tracking-wide">{typeLabels[slide.type] ?? slide.type}</span>
            {slideReview.issues.length > 0 && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {slideReview.issues.length} problema{slideReview.issues.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white truncate">{slide.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreBadge score={slideReview.overallScore} />
          {slideReview.accepted === true && <Check className="h-4 w-4 text-green-400" />}
          {slideReview.accepted === false && <X className="h-4 w-4 text-white/30" />}
          {expanded ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
          {/* Scores */}
          <div className="space-y-2">
            <ScoreBar label="Clareza" value={slideReview.scores.clarity} />
            <ScoreBar label="Persuasão" value={slideReview.scores.persuasion} />
            <ScoreBar label="Engajamento" value={slideReview.scores.engagement} />
          </div>

          {/* Issues */}
          {slideReview.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Problemas encontrados</p>
              {slideReview.issues.map((issue, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-yellow-300">{ISSUE_LABELS[issue.type]}: </span>
                    <span className="text-white/60">{issue.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestion */}
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Sugestão da IA</p>
            <div>
              <p className="text-xs text-white/40 mb-1">Título:</p>
              <p className="text-sm font-semibold text-white">{slideReview.suggestedTitle}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Corpo:</p>
              <p className="text-sm text-white/80 leading-relaxed">{slideReview.suggestedBody}</p>
            </div>
          </div>

          {/* Action buttons */}
          {slideReview.accepted === null ? (
            <div className="flex gap-2">
              <Button onClick={onAccept} size="sm" className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20">
                <Check className="h-3.5 w-3.5" /> Aplicar sugestão
              </Button>
              <Button onClick={onReject} size="sm" variant="outline" className="flex-1 border-white/10 text-white/60 hover:bg-white/5">
                <X className="h-3.5 w-3.5" /> Manter original
              </Button>
            </div>
          ) : (
            <div className={cn("flex items-center gap-2 text-sm py-1", slideReview.accepted ? "text-green-400" : "text-white/40")}>
              {slideReview.accepted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {slideReview.accepted ? "Sugestão aplicada" : "Original mantido"}
              <button onClick={() => slideReview.accepted ? onReject() : onAccept()} className="ml-auto text-xs text-white/30 hover:text-white underline">
                Desfazer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
