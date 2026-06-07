"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "carrosseiro_cookie_consent";

type ConsentState = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentState | null;
    setConsent(stored);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  }

  function reject() {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setConsent("rejected");
  }

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md">
      <div className="rounded-2xl border border-white/10 bg-[#0f0f1e] shadow-2xl p-5 backdrop-blur-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
            <Cookie className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Cookies e Privacidade</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Usamos cookies essenciais para o funcionamento do site e cookies analíticos (com seu consentimento) para melhorar a experiência.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <Button onClick={accept} variant="gradient" size="sm" className="flex-1">
            Aceitar todos
          </Button>
          <Button onClick={reject} variant="outline" size="sm" className="flex-1 border-white/10 text-white hover:bg-white/5">
            Apenas essenciais
          </Button>
        </div>

        <p className="text-center text-xs text-white/30">
          Saiba mais em nossa{" "}
          <Link href="/privacidade" className="text-indigo-400 hover:underline">Política de Privacidade</Link>
          {" "}(LGPD)
        </p>
      </div>
    </div>
  );
}
