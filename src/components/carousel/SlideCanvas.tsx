import type { SlideData, ThemeConfig } from "@/types/carousel";
import { cn } from "@/lib/utils";

interface Props {
  slide: SlideData;
  theme: ThemeConfig;
  size?: "preview" | "export";
  className?: string;
}

export function SlideCanvas({ slide, theme, size = "preview", className }: Props) {
  const isExport = size === "export";
  const wrapperSize = isExport ? "w-[1080px] h-[1080px]" : "w-full aspect-square";

  const titleSize = isExport
    ? slide.type === "cover" ? "text-7xl" : "text-5xl"
    : slide.type === "cover" ? "text-2xl" : "text-lg";

  const bodySize = isExport ? "text-3xl" : "text-sm";

  return (
    <div
      className={cn("relative overflow-hidden flex flex-col", wrapperSize, className)}
      style={{ background: slide.customizations?.bgColor ?? `linear-gradient(135deg, ${theme.bgColor} 0%, ${theme.primaryColor}20 100%)`, fontFamily: theme.fontFamily, color: slide.customizations?.textColor ?? theme.textColor }}
      data-slide-canvas
    >
      {/* Decorative bg element */}
      <div className="absolute top-0 right-0 h-1/2 w-1/2 rounded-bl-full opacity-10" style={{ background: theme.primaryColor }} />
      <div className="absolute bottom-0 left-0 h-1/3 w-1/3 rounded-tr-full opacity-5" style={{ background: theme.accentColor }} />

      {/* Slide number indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-60">
        <div className="h-1 w-4 rounded-full" style={{ background: theme.primaryColor }} />
        <span className="text-xs" style={{ color: theme.accentColor }}>{slide.index + 1}</span>
      </div>

      {/* Content */}
      <div className={cn(
        "relative z-10 flex flex-col h-full",
        theme.layout === "centered" ? "items-center justify-center text-center px-8" : "justify-center px-8"
      )}>
        {slide.emoji && (
          <span className={cn("mb-4 block", isExport ? "text-7xl" : "text-3xl")}>{slide.emoji}</span>
        )}

        {slide.type === "cover" ? (
          <>
            <h2 className={cn("font-black leading-tight mb-4", titleSize)} style={{ color: theme.textColor }}>
              {slide.title}
            </h2>
            <p className={cn("opacity-70 leading-relaxed", bodySize)} style={{ color: theme.textColor }}>
              {slide.body}
            </p>
            {/* Accent bar */}
            <div className="mt-6 h-1 w-16 rounded-full" style={{ background: theme.primaryColor }} />
          </>
        ) : slide.type === "cta" ? (
          <>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${theme.primaryColor}30` }}>
              <span className={isExport ? "text-4xl" : "text-xl"}>📲</span>
            </div>
            <h2 className={cn("font-bold leading-tight mb-3", titleSize)} style={{ color: theme.textColor }}>
              {slide.title}
            </h2>
            <p className={cn("opacity-70 mb-6", bodySize)} style={{ color: theme.textColor }}>
              {slide.body}
            </p>
            <div className={cn("rounded-full font-semibold flex items-center justify-center", isExport ? "px-10 py-5 text-2xl" : "px-4 py-2 text-xs")} style={{ background: theme.primaryColor, color: "#fff" }}>
              Seguir agora →
            </div>
          </>
        ) : (
          <>
            <h2 className={cn("font-bold leading-tight mb-4", titleSize)} style={{ color: theme.primaryColor }}>
              {slide.title}
            </h2>
            <p className={cn("leading-relaxed opacity-80", bodySize)} style={{ color: theme.textColor }}>
              {slide.body}
            </p>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="h-0.5 flex-1 rounded-full opacity-20" style={{ background: theme.accentColor }} />
        <span className={cn("mx-3 opacity-40 font-bold", isExport ? "text-lg" : "text-[9px]")}>CARROSSEIRO</span>
        <div className="h-0.5 flex-1 rounded-full opacity-20" style={{ background: theme.accentColor }} />
      </div>
    </div>
  );
}
