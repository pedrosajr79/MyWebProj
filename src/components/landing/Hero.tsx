"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a15] pt-16">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="container relative z-10 text-center">
        {/* Social proof pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
          <div className="flex -space-x-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0a0a15] bg-gradient-to-br from-indigo-400 to-purple-500" />
            ))}
          </div>
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span><strong className="text-white">4.9</strong> · Mais de 10.000 criadores</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
          Carrosséis virais{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            com IA
          </span>{" "}
          em segundos
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
          Digite o tema, escolha o estilo e a IA escreve, projeta e exporta seus slides profissionais prontos para publicar no Instagram.
          <span className="text-white/90"> Sem ChatGPT. Sem Canva. Tudo num só lugar.</span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="gradient" size="xl" className="w-full sm:w-auto">
            <Link href="/register">
              Criar meu primeiro carrossel grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
            <Link href="#como-funciona">Ver como funciona</Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-white/40">Sem cartão de crédito · 3 carrosséis grátis todo mês</p>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-10">
          {[
            { icon: Zap, value: "< 30s", label: "Para gerar um carrossel" },
            { icon: Users, value: "10k+", label: "Criadores ativos" },
            { icon: Star, value: "98%", label: "Taxa de satisfação" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-white/50 text-center">{label}</p>
            </div>
          ))}
        </div>

        {/* Mock carousel preview */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="flex gap-3 justify-center overflow-hidden">
            {[
              { bg: "#1e1b4b", accent: "#6366f1", title: "5 erros que estão te impedindo de crescer", body: "Você sabe quais são?" },
              { bg: "#0f172a", accent: "#0ea5e9", title: "Erro #1", body: "Postar sem consistência é o maior assassino de contas no Instagram." },
              { bg: "#1e1b4b", accent: "#6366f1", title: "Erro #2", body: "Criar conteúdo sem estratégia clara de persona e nicho." },
            ].map((slide, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 h-48 w-36 md:h-64 md:w-48 rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between p-4 shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${slide.bg}, #0a0a15)` }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: slide.accent }} />
                  <span className="text-xs text-white/40">{i + 1}/7</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight mb-2">{slide.title}</p>
                  <p className="text-[10px] text-white/60 leading-tight">{slide.body}</p>
                </div>
                <div className="h-0.5 w-full rounded-full" style={{ background: `${slide.accent}40` }}>
                  <div className="h-full rounded-full" style={{ width: `${(i + 1) * 33}%`, background: slide.accent }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/30">↑ Preview real de carrossel gerado com IA</p>
        </div>
      </div>
    </section>
  );
}
