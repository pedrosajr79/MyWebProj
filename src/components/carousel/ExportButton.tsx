"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Archive } from "lucide-react";
import type { SlideData, ThemeConfig } from "@/types/carousel";

interface Props {
  slides: SlideData[];
  theme: ThemeConfig;
  title: string;
}

export function ExportButton({ slides, theme, title }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function exportPNGs() {
    setLoading("png");
    setOpen(false);
    try {
      const { toPng } = await import("html-to-image");
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Render each slide off-screen and capture
      for (let i = 0; i < slides.length; i++) {
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1080px;height:1080px;z-index:-1";
        document.body.appendChild(container);

        const { createRoot } = await import("react-dom/client");
        const { SlideCanvas } = await import("./SlideCanvas");
        const React = await import("react");

        const root = createRoot(container);
        root.render(React.createElement(SlideCanvas, { slide: slides[i], theme, size: "export" }));

        await new Promise(r => setTimeout(r, 300));
        const dataUrl = await toPng(container.firstChild as HTMLElement, { width: 1080, height: 1080, pixelRatio: 1 });
        const base64 = dataUrl.split(",")[1];
        zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, base64, { base64: true });

        root.unmount();
        document.body.removeChild(container);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-slides.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${slides.length} slides exportados com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar slides");
    } finally {
      setLoading(null);
    }
  }

  async function exportPDF() {
    setLoading("pdf");
    setOpen(false);
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [150, 150] });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage();
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1080px;height:1080px;z-index:-1";
        document.body.appendChild(container);

        const { createRoot } = await import("react-dom/client");
        const { SlideCanvas } = await import("./SlideCanvas");
        const React = await import("react");

        const root = createRoot(container);
        root.render(React.createElement(SlideCanvas, { slide: slides[i], theme, size: "export" }));

        await new Promise(r => setTimeout(r, 300));
        const dataUrl = await toPng(container.firstChild as HTMLElement, { width: 1080, height: 1080, pixelRatio: 1 });
        pdf.addImage(dataUrl, "PNG", 0, 0, 150, 150);

        root.unmount();
        document.body.removeChild(container);
      }

      pdf.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar PDF");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="gradient"
        onClick={() => setOpen(v => !v)}
        loading={!!loading}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {loading === "png" ? "Exportando PNGs..." : loading === "pdf" ? "Exportando PDF..." : "Exportar slides"}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#0f0f1e] shadow-2xl z-50 overflow-hidden">
          <div className="p-1">
            <button onClick={exportPNGs} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
              <Archive className="h-4 w-4 text-indigo-400" />
              <div className="text-left">
                <p className="font-medium">PNG (ZIP)</p>
                <p className="text-xs text-white/40">1 arquivo por slide</p>
              </div>
            </button>
            <button onClick={exportPDF} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
              <FileText className="h-4 w-4 text-purple-400" />
              <div className="text-left">
                <p className="font-medium">PDF</p>
                <p className="text-xs text-white/40">Todos os slides em 1 arquivo</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
