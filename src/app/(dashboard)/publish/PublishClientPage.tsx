"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SocialConnectionCard, type SocialConnection, type Platform } from "@/components/publish/SocialConnectionCard";
import { PublishForm } from "@/components/publish/PublishForm";
import { ScheduledPostCard, type ScheduledPost } from "@/components/publish/ScheduledPostCard";
import { Share2, Wifi, Clock } from "lucide-react";
import { toast } from "sonner";

const ALL_PLATFORMS: Platform[] = ["instagram", "facebook", "linkedin", "twitter", "tiktok"];

interface Carousel {
  id: string;
  title: string;
  topic: string;
  slide_count: number;
}

interface Props {
  initialConnections: SocialConnection[];
  carousels: Carousel[];
  initialPosts: ScheduledPost[];
}

export function PublishClientPage({ initialConnections, carousels, initialPosts }: Props) {
  const [connections, setConnections] = useState<SocialConnection[]>(initialConnections);
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) {
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} conectado com sucesso!`);
    } else if (error === "oauth_denied") {
      toast.error("Autorização negada pelo usuário.");
    } else if (error === "oauth_not_configured") {
      const platform = searchParams.get("platform") ?? "";
      toast.error(`Credenciais OAuth para ${platform} não configuradas. Adicione as variáveis de ambiente.`, { duration: 8000 });
    } else if (error) {
      toast.error(`Erro ao conectar: ${decodeURIComponent(error)}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Organise connections by platform for quick lookup
  const connectionByPlatform = Object.fromEntries(
    connections.map((c) => [c.platform, c])
  ) as Record<Platform, SocialConnection | undefined>;

  const handleDisconnect = useCallback((id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: false } : c))
    );
  }, []);

  // TODO: After real OAuth is implemented, this handler should receive the
  // newly created connection from the callback and add it to state.
  const handleConnect = useCallback((_platform: Platform) => {
    // OAuth redirect will happen inside SocialConnectionCard.
    // For MVP the toast is shown by SocialConnectionCard itself.
  }, []);

  const handlePostSuccess = useCallback(async () => {
    // Re-fetch posts after a new one is created
    try {
      const res = await fetch("/api/publish/schedule?limit=30");
      if (!res.ok) return;
      const { posts: fresh } = await res.json();
      setPosts(fresh ?? []);
    } catch {
      // Silent fail — the form already shows a success toast
    }
  }, []);

  const handleCancelPost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "cancelled" as const } : p))
    );
  }, []);

  const activeCount = connections.filter((c) => c.is_active).length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left column: connections + form */}
      <div className="lg:col-span-3 space-y-8">
        {/* Connected accounts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Redes conectadas</h2>
            {activeCount > 0 && (
              <span className="ml-auto text-xs text-white/30">
                {activeCount} conectada{activeCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {ALL_PLATFORMS.map((platform) => (
              <SocialConnectionCard
                key={platform}
                platform={platform}
                connection={connectionByPlatform[platform]}
                onDisconnect={handleDisconnect}
                onConnect={handleConnect}
              />
            ))}
          </div>
        </section>

        {/* Publish form */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Nova publicação</h2>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <PublishForm
              connections={connections}
              carousels={carousels}
              onSuccess={handlePostSuccess}
            />
          </div>
        </section>
      </div>

      {/* Right column: scheduled posts */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Posts agendados</h2>
          {scheduledCount > 0 && (
            <span className="ml-auto text-xs bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full">
              {scheduledCount}
            </span>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/8 p-8 text-center">
            <Clock className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/40">Nenhum post agendado</p>
            <p className="text-xs text-white/25 mt-1">
              Posts publicados e agendados aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {posts.map((post) => (
              <ScheduledPostCard
                key={post.id}
                post={post}
                onCancel={handleCancelPost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
