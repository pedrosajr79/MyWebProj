"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Loader2, Ban, Hash, Trash2 } from "lucide-react";
import { toast } from "sonner";

export type PostStatus = "scheduled" | "publishing" | "published" | "failed" | "cancelled";

export interface ScheduledPost {
  id: string;
  platform: string;
  status: PostStatus;
  caption: string | null;
  hashtags: string[] | null;
  scheduled_at: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  social_connections: {
    account_name: string | null;
    platform: string;
  } | null;
  carousels: {
    title: string;
    topic: string;
  } | null;
}

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline"; icon: React.ReactNode }
> = {
  scheduled: {
    label: "Agendado",
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
  },
  publishing: {
    label: "Publicando...",
    variant: "warning",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  published: {
    label: "Publicado",
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  failed: {
    label: "Falhou",
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />,
  },
  cancelled: {
    label: "Cancelado",
    variant: "outline",
    icon: <Ban className="h-3 w-3" />,
  },
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "text-pink-400",
  facebook: "text-blue-400",
  linkedin: "text-sky-400",
  twitter: "text-white/70",
  tiktok: "text-rose-400",
};

function formatScheduledDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

interface Props {
  post: ScheduledPost;
  onCancel?: (id: string) => void;
}

export function ScheduledPostCard({ post, onCancel }: Props) {
  const [cancelling, setCancelling] = useState(false);

  const statusConfig = STATUS_CONFIG[post.status];
  const platformColor = PLATFORM_COLORS[post.platform] ?? "text-white/50";
  const accountName = post.social_connections?.account_name;
  const canCancel = post.status === "scheduled";

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/publish/schedule?id=${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao cancelar");
      toast.success("Post cancelado");
      onCancel?.(post.id);
    } catch {
      toast.error("Não foi possível cancelar o post");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-3 transition-all",
        post.status === "published"
          ? "border-green-500/15 bg-green-500/5"
          : post.status === "failed"
          ? "border-red-500/15 bg-red-500/5"
          : post.status === "cancelled"
          ? "border-white/5 bg-white/[0.01] opacity-60"
          : "border-white/8 bg-white/[0.02]"
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("text-sm font-semibold capitalize shrink-0", platformColor)}>
            {post.platform}
          </span>
          {accountName && (
            <span className="text-xs text-white/40 truncate">@{accountName}</span>
          )}
        </div>
        <Badge
          variant={statusConfig.variant}
          className="shrink-0 gap-1 text-xs py-0.5"
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Carousel title */}
      {post.carousels?.title && (
        <p className="text-sm text-white/70 font-medium truncate">
          {post.carousels.title}
        </p>
      )}

      {/* Caption preview */}
      {post.caption && (
        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.hashtags.slice(0, 5).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 text-xs text-indigo-400/70">
              <Hash className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {post.hashtags.length > 5 && (
            <span className="text-xs text-white/30">+{post.hashtags.length - 5}</span>
          )}
        </div>
      )}

      {/* Error message */}
      {post.status === "failed" && post.error_message && (
        <p className="text-xs text-red-400/80 bg-red-500/10 rounded-lg px-3 py-2">
          {post.error_message}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
        <div className="text-xs text-white/30 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {post.scheduled_at
            ? formatScheduledDate(post.scheduled_at)
            : post.published_at
            ? `Publicado em ${formatScheduledDate(post.published_at)}`
            : "Publicação imediata"}
        </div>
        {canCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            loading={cancelling}
            className="h-7 px-2 text-xs text-white/30 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
