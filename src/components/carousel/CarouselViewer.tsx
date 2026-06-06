"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SlideCanvas } from "./SlideCanvas";
import type { SlideData, ThemeConfig } from "@/types/carousel";

interface Props {
  slides: SlideData[];
  theme: ThemeConfig;
}

export function CarouselViewer({ slides, theme }: Props) {
  const [current, setCurrent] = useState(0);

  function prev() { setCurrent(i => Math.max(0, i - 1)); }
  function next() { setCurrent(i => Math.min(slides.length - 1, i + 1)); }

  if (!slides.length) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main slide */}
      <div className="relative w-full max-w-sm mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <SlideCanvas slide={slides[current]} theme={theme} />
        </div>

        {/* Nav buttons */}
        {current > 0 && (
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {current < slides.length - 1 && (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Slide counter */}
      <div className="flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-indigo-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
      <p className="text-sm text-white/40">{current + 1} de {slides.length}</p>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto w-full pb-2">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ring-2 transition-all ${i === current ? "ring-indigo-500" : "ring-transparent hover:ring-white/20"}`}
          >
            <SlideCanvas slide={slide} theme={theme} />
          </button>
        ))}
      </div>
    </div>
  );
}
