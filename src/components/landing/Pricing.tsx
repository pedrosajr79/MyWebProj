"use client";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Para conhecer a plataforma",
    badge: null,
    features: [
      { text: "3 carrosséis por mês", ok: true },
      { text: "Até 7 slides por carrossel", ok: true },
      { text: "Export PNG (com marca d'água)", ok: true },
      { text: "5 temas visuais", ok: true },
      { text: "Histórico por 7 dias", ok: true },
      { text: "Export PDF", ok: false },
      { text: "Perfis de marca", ok: false },
      { text: "Calendário editorial", ok: false },
    ],
    cta: "Começar grátis",
    ctaVariant: "outline" as const,
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 3700,
    yearly: 2900,
    description: "Para criadores sérios",
    badge: "Mais popular",
    features: [
      { text: "30 carrosséis por mês", ok: true },
      { text: "Até 15 slides por carrossel", ok: true },
      { text: "Export PNG + PDF sem marca d'água", ok: true },
      { text: "Todos os temas + temas customizados", ok: true },
      { text: "Histórico por 90 dias", ok: true },
      { text: "Perfis de marca (até 3)", ok: true },
      { text: "Calendário editorial", ok: true },
      { text: "Suporte por e-mail", ok: true },
    ],
    cta: "Assinar Pro",
    ctaVariant: "gradient" as const,
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    monthly: 9700,
    yearly: 7700,
    description: "Para agências e times",
    badge: null,
    features: [
      { text: "Carrosséis ilimitados", ok: true },
      { text: "Até 20 slides por carrossel", ok: true },
      { text: "Export PNG + PDF sem marca d'água", ok: true },
      { text: "Temas customizados ilimitados", ok: true },
      { text: "Histórico ilimitado", ok: true },
      { text: "Perfis de marca ilimitados", ok: true },
      { text: "Calendário editorial + relatórios", ok: true },
      { text: "Suporte prioritário", ok: true },
    ],
    cta: "Assinar Business",
    ctaVariant: "outline" as const,
    highlight: false,
  },
];

function formatPrice(cents: number) {
  if (cents === 0) return "Grátis";
  return `R$ ${(cents / 100).toFixed(0).replace(".", ",")}/mês`;
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="planos" className="bg-[#0a0a15] py-24">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">Planos</p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Comece grátis,{" "}
            <span className="text-white/40">cresça quando precisar</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg">Sem surpresas. Cancele quando quiser.</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${!yearly ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${yearly ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              Anual
              <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">-22%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlight
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 px-4">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-white/50 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.monthly === 0 ? "Grátis" : `R$ ${((yearly ? plan.yearly : plan.monthly) / 100).toFixed(0)}`}
                  </span>
                  {plan.monthly > 0 && <span className="text-white/50">/mês</span>}
                  {yearly && plan.monthly > 0 && (
                    <p className="text-sm text-green-400 mt-1">Cobrado anualmente</p>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.ok ? (
                      <Check className="h-4 w-4 shrink-0 text-green-400" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-white/20" />
                    )}
                    <span className={f.ok ? "text-white/80" : "text-white/30 line-through"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant={plan.ctaVariant} size="lg" className={`w-full ${!plan.highlight ? "border-white/20 text-white hover:bg-white/10" : ""}`}>
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-white/30">
          Todos os planos incluem SSL, backups automáticos e atualizações gratuitas.
        </p>
      </div>
    </section>
  );
}
