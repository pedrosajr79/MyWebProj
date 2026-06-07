"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  planId: string;
  planName: string;
  currentPlan: string;
  hasSubscription: boolean;
  isPaid: boolean;
  isHighlight: boolean;
}

export function BillingActions({ planId, planName, currentPlan, hasSubscription, isPaid, isHighlight }: Props) {
  const [loading, setLoading] = useState(false);

  const isCurrent = currentPlan === planId;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar sessão");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao redirecionar para pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao abrir portal");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir portal de faturamento");
    } finally {
      setLoading(false);
    }
  };

  if (isCurrent) {
    return (
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full border-white/10 text-white/50" disabled>
          Plano ativo
        </Button>
        {isPaid && hasSubscription && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white/30 hover:text-white/60 text-xs"
            onClick={handlePortal}
            disabled={loading}
          >
            {loading && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
            Gerenciar assinatura
          </Button>
        )}
      </div>
    );
  }

  if (planId === "free") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full border-white/10 text-white hover:bg-white/5"
        onClick={handlePortal}
        disabled={loading || !hasSubscription}
      >
        {loading && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
        {hasSubscription ? "Fazer downgrade" : "Plano atual"}
      </Button>
    );
  }

  const label = currentPlan === "free"
    ? `Assinar ${planName}`
    : `Mudar para ${planName}`;

  return (
    <Button
      variant={isHighlight ? "gradient" : "outline"}
      size="sm"
      className={`w-full ${!isHighlight ? "border-white/10 text-white hover:bg-white/5" : ""}`}
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
}
