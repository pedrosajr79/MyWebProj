import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CarouselViewer } from "@/components/carousel/CarouselViewer";
import { ExportButton } from "@/components/carousel/ExportButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

export default async function CarouselDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: carousel } = await supabase.from("carousels").select("*").eq("id", id).eq("user_id", user!.id).single();
  if (!carousel) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
          <Link href="/carousels"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{carousel.title}</h1>
          <p className="text-white/40 text-sm mt-0.5">Criado em {formatDate(carousel.created_at)} · {carousel.slide_count} slides</p>
        </div>
        <ExportButton slides={carousel.slides} theme={carousel.theme} title={carousel.title} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Viewer */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <CarouselViewer slides={carousel.slides} theme={carousel.theme} />
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">Detalhes</h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Tema", value: carousel.topic },
                { label: "Tom", value: carousel.tone },
                { label: "Slides", value: carousel.slide_count },
                { label: "Status", value: carousel.status },
                { label: "Tema visual", value: carousel.theme?.name },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-white/40">{label}</dt>
                  <dd className="text-white font-medium capitalize truncate max-w-[60%] text-right">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">Slides</h3>
            <div className="space-y-2">
              {carousel.slides.map((slide: { index: number; type: string; title: string }) => (
                <div key={slide.index} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold">{slide.index + 1}</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-white/30">{slide.type}</span>
                    <p className="text-white/70 leading-tight">{slide.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
