"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Send, Clock, X, Hash, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { SocialConnection } from "./SocialConnectionCard";

interface Carousel {
  id: string;
  title: string;
  topic: string;
  slide_count: number;
}

interface Props {
  connections: SocialConnection[];
  carousels: Carousel[];
  onSuccess?: () => void;
}

export function PublishForm({ connections, carousels, onSuccess }: Props) {
  const [carouselId, setCarouselId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeConnections = connections.filter((c) => c.is_active);

  const addHashtag = (raw: string) => {
    const tags = raw
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#+/, "").trim().toLowerCase())
      .filter(Boolean);
    setHashtags((prev) => Array.from(new Set([...prev, ...tags])));
    setHashtagInput("");
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      if (hashtagInput.trim()) addHashtag(hashtagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connectionId) {
      toast.error("Selecione uma rede social para publicar.");
      return;
    }

    if (scheduleMode === "later" && !scheduledAt) {
      toast.error("Informe a data e hora para agendamento.");
      return;
    }

    // Validate scheduled date is in the future
    if (scheduleMode === "later" && new Date(scheduledAt) <= new Date()) {
      toast.error("A data de agendamento deve ser no futuro.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/publish/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carousel_id: carouselId || null,
          connection_id: connectionId,
          caption: caption.trim() || null,
          hashtags,
          scheduled_at: scheduleMode === "later" ? scheduledAt : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao publicar");

      toast.success(
        scheduleMode === "later"
          ? "Post agendado com sucesso!"
          : "Post enviado para publicação!"
      );

      // Reset form
      setCarouselId("");
      setConnectionId("");
      setCaption("");
      setHashtags([]);
      setHashtagInput("");
      setScheduledAt("");
      setScheduleMode("now");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Minimum datetime for scheduling (now + 5 min)
  const minSchedule = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Network selector */}
      <div className="space-y-2">
        <Label className="text-white/70">Rede social *</Label>
        {activeConnections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-white/40">
            Nenhuma rede conectada. Conecte uma rede social acima.
          </div>
        ) : (
          <div className="relative">
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className={cn(
                "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                "appearance-none cursor-pointer",
                !connectionId && "text-white/40"
              )}
            >
              <option value="" disabled className="bg-[#0a0a15]">
                Selecione uma conta conectada...
              </option>
              {activeConnections.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0a0a15] text-white capitalize">
                  {c.platform}{c.account_name ? ` — @${c.account_name}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          </div>
        )}
      </div>

      {/* Carousel selector */}
      <div className="space-y-2">
        <Label className="text-white/70">Carrossel (opcional)</Label>
        <div className="relative">
          <select
            value={carouselId}
            onChange={(e) => setCarouselId(e.target.value)}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
              "appearance-none cursor-pointer",
              !carouselId && "text-white/40"
            )}
          >
            <option value="" className="bg-[#0a0a15]">
              Sem carrossel vinculado
            </option>
            {carousels.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0a0a15] text-white">
                {c.title} — {c.slide_count} slides
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <Label className="text-white/70">Legenda</Label>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Escreva a legenda do seu post..."
          rows={4}
          maxLength={2200}
          className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/50 resize-none"
        />
        <p className="text-xs text-white/30 text-right">{caption.length}/2200</p>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <Label className="text-white/70">Hashtags</Label>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 min-h-[50px] flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20 gap-1 pr-1"
            >
              <Hash className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeHashtag(tag)}
                className="ml-0.5 rounded-full hover:bg-white/10 p-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          <Input
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            onBlur={() => { if (hashtagInput.trim()) addHashtag(hashtagInput); }}
            placeholder={hashtags.length === 0 ? "Digite hashtags e pressione Enter..." : ""}
            className="h-7 min-w-[180px] flex-1 border-0 bg-transparent p-0 text-sm text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <p className="text-xs text-white/30">Pressione Enter, espaço ou vírgula para adicionar</p>
      </div>

      {/* Schedule toggle */}
      <div className="space-y-3">
        <Label className="text-white/70">Quando publicar?</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setScheduleMode("now")}
            className={cn(
              "flex-1 rounded-xl border p-3 text-sm font-medium transition-all text-center",
              scheduleMode === "now"
                ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
            )}
          >
            <Send className="h-4 w-4 mx-auto mb-1" />
            Publicar agora
          </button>
          <button
            type="button"
            onClick={() => setScheduleMode("later")}
            className={cn(
              "flex-1 rounded-xl border p-3 text-sm font-medium transition-all text-center",
              scheduleMode === "later"
                ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
            )}
          >
            <Clock className="h-4 w-4 mx-auto mb-1" />
            Agendar
          </button>
        </div>

        {scheduleMode === "later" && (
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Data e hora</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minSchedule}
              className="border-white/10 bg-white/[0.03] text-white [color-scheme:dark] focus:border-indigo-500/50 focus:ring-indigo-500/50"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gradient"
        className="w-full"
        loading={submitting}
        disabled={activeConnections.length === 0}
      >
        {submitting ? (
          "Processando..."
        ) : scheduleMode === "later" ? (
          <>
            <Clock className="h-4 w-4" />
            Agendar publicação
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Publicar agora
          </>
        )}
      </Button>
    </form>
  );
}
