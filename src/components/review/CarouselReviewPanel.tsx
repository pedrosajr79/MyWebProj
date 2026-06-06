"use client";
import { CheckCircle, AlertCircle, Sparkles, ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideReviewCard } from "./SlideReviewCard";
import type { CarouselReview, SlideData } from "@/types/carousel";
import { cn } from "@/lib/utils";

interface Props {
  review: CarouselReview;
  slides: SlideData[];
  onAccept: (index: number) => void;
  onReject: (index: number) => void;
  onApplyAll: () => void;
  onContinue: () => void;
  isAllDecided: boolean;
}

export function CarouselReviewPanel({ review, slides, onAccept, onReject, onApplyAll, onContinue, isAllDecided }: Props) {
  const approved = review.verdict === "approved";
  const pending = review.slideReviews.filter(r => r.accepted === null).length;

  return (
    <div className="space-y-6">
      {/* Verdict header */}
      <div className={cn(
        "rounded-2xl border p-6",
        approved ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", approved ? "bg-green-500/20" : "bg-yellow-500/20")}>
            {approved
              ? <CheckCircle className="h-6 w-6 text-green-400" />
              : <AlertCircle className="h-6 w-6 text-yellow-400" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-white text-lg">
                {approved ? "Aprovado!" : "Precisa de ajustes"}
              </h3>
              <span className={cn("text-2xl font-black", approved ? "text-green-400" : "text-yellow-400")}>
                {review.overallScore}/10
              </span>
            </div>
            <p className={cn("text-sm", approved ? "text-green-300/80" : "text-yellow-300/80")}>
              {review.verdictReason}
            </p>

            {/* Overall progress bar */}
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full transition-all", approved ? "bg-green-500" : review.overallScore >= 5 ? "bg-yellow-500" : "bg-red-500")}
                style={{ width: `${review.overallScore * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Total de slides", value: review.slideReviews.length },
            { label: "Com problemas", value: review.slideReviews.filter(r => r.issues.length > 0).length },
            { label: "Pendentes", value: pending },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-white/5 p-3 text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <p className="text-sm text-white/60">
            Revise cada slide abaixo e aceite ou rejeite as sugestões
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {pending > 0 && (
            <Button onClick={onApplyAll} size="sm" variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
              <ChevronsDown className="h-3.5 w-3.5" />
              Aplicar todas ({pending})
            </Button>
          )}
          {isAllDecided && (
            <Button onClick={onContinue} variant="gradient" size="sm">
              <CheckCircle className="h-3.5 w-3.5" />
              Continuar para exportar
            </Button>
          )}
        </div>
      </div>

      {/* Slide review cards */}
      <div className="space-y-3">
        {review.slideReviews.map(sr => {
          const slide = slides.find(s => s.index === sr.slideIndex);
          if (!slide) return null;
          return (
            <SlideReviewCard
              key={sr.slideIndex}
              slideReview={sr}
              slide={slide}
              onAccept={() => onAccept(sr.slideIndex)}
              onReject={() => onReject(sr.slideIndex)}
            />
          );
        })}
      </div>

      {/* Bottom continue button */}
      {isAllDecided && (
        <Button onClick={onContinue} variant="gradient" size="lg" className="w-full">
          <CheckCircle className="h-5 w-5" />
          Pronto! Continuar para exportar e publicar
        </Button>
      )}
    </div>
  );
}
