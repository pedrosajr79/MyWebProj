"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";

export interface SocialConnection {
  id: string;
  platform: Platform;
  account_name: string | null;
  account_id: string | null;
  is_active: boolean;
  token_expires_at: string | null;
  created_at: string;
}

const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string; bgColor: string; borderColor: string; logo: React.ReactNode }
> = {
  instagram: {
    label: "Instagram",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  linkedin: {
    label: "LinkedIn",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  twitter: {
    label: "Twitter / X",
    color: "text-white/70",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
      </svg>
    ),
  },
};

interface Props {
  connection?: SocialConnection;
  platform: Platform;
  onDisconnect?: (id: string) => void;
  onConnect?: (platform: Platform) => void;
}

export function SocialConnectionCard({ connection, platform, onDisconnect, onConnect }: Props) {
  const [loading, setLoading] = useState(false);
  const config = PLATFORM_CONFIG[platform];
  const isConnected = !!connection?.is_active;

  const handleDisconnect = async () => {
    if (!connection) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/publish/connections?id=${connection.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao desconectar");
      toast.success(`${config.label} desconectado`);
      onDisconnect?.(connection.id);
    } catch {
      toast.error("Não foi possível desconectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    // Redirect to OAuth initiation endpoint — server will build the provider URL
    window.location.href = `/api/publish/connections/oauth/${platform}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all",
        isConnected ? config.borderColor : "border-white/5",
        isConnected ? config.bgColor : "bg-white/[0.02]"
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
            isConnected ? config.bgColor : "bg-white/5",
            isConnected ? config.color : "text-white/30"
          )}
        >
          {config.logo}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", isConnected ? "text-white" : "text-white/50")}>
              {config.label}
            </span>
            {isConnected ? (
              <Badge variant="success" className="text-xs py-0 px-1.5">
                <Wifi className="h-2.5 w-2.5 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs py-0 px-1.5 text-white/30 border-white/10">
                <WifiOff className="h-2.5 w-2.5 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
          {isConnected && connection?.account_name && (
            <p className="text-xs text-white/40 truncate mt-0.5">@{connection.account_name}</p>
          )}
          {!isConnected && (
            <p className="text-xs text-white/30 mt-0.5">Clique em conectar para vincular sua conta</p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            loading={loading}
            className="border-white/10 text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
          >
            Desconectar
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            loading={loading}
            className={cn(
              "border-white/10 transition-colors",
              `hover:${config.bgColor} hover:${config.color} hover:${config.borderColor}`
            )}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Conectar
          </Button>
        )}
      </div>
    </div>
  );
}
