"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CarouselReview, SlideData, GenerationMeta } from "@/types/carousel";

type ReviewStatus = "idle" | "loading" | "done" | "error";

export function useCarouselReview(initialSlides: SlideData[]) {
  const [review, setReview] = useState<CarouselReview | null>(null);
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);

  const startReview = useCallback(async (currentSlides: SlideData[], meta: GenerationMeta) => {
    setStatus("loading");
    setSlides(currentSlides);
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: currentSlides, ...meta }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro na revisão");
      }
      const data = await res.json();
      setReview(data.review);
      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Erro na revisão com IA");
    }
  }, []);

  // Accept a suggestion: apply suggestedTitle/suggestedBody to the slide
  const acceptSuggestion = useCallback((index: number) => {
    setReview(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slideReviews: prev.slideReviews.map(r =>
          r.slideIndex === index ? { ...r, accepted: true } : r
        ),
      };
    });
    setSlides(prev => {
      const sr = review?.slideReviews.find(r => r.slideIndex === index);
      if (!sr) return prev;
      return prev.map(s =>
        s.index === index ? { ...s, title: sr.suggestedTitle, body: sr.suggestedBody } : s
      );
    });
  }, [review]);

  const rejectSuggestion = useCallback((index: number) => {
    setReview(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slideReviews: prev.slideReviews.map(r =>
          r.slideIndex === index ? { ...r, accepted: false } : r
        ),
      };
    });
  }, []);

  const applyAll = useCallback(() => {
    if (!review) return;
    setReview(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slideReviews: prev.slideReviews.map(r => ({ ...r, accepted: r.accepted ?? true })),
      };
    });
    setSlides(prev =>
      prev.map(s => {
        const sr = review.slideReviews.find(r => r.slideIndex === s.index && r.accepted === null);
        return sr ? { ...s, title: sr.suggestedTitle, body: sr.suggestedBody } : s;
      })
    );
  }, [review]);

  const isAllDecided = review ? review.slideReviews.every(r => r.accepted !== null) : false;
  const isApproved = isAllDecided && review?.verdict === "approved";

  return { review, status, slides, startReview, acceptSuggestion, rejectSuggestion, applyAll, isAllDecided, isApproved };
}
