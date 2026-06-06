import { MousePointerClick, Sparkles, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MousePointerClick,
    title: "Escolha o tema",
    description: "Digite o assunto do carrossel ou selecione um dos seus perfis de marca já configurados com sua identidade visual. A IA já sabe quem é você.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "A IA escreve e projeta",
    description: "Em segundos a IA gera o texto persuasivo, monta o design profissional de cada slide e aplica sua paleta de cores e tipografia.",
    color: "from-purple-500 to-purple-600",
  },
  {
    num: "03",
    icon: Download,
    title: "Exporte e publique",
    description: "Ajuste o que quiser, aplique sua identidade visual e baixe os slides em alta resolução prontos para publicar no Instagram.",
    color: "from-pink-500 to-pink-600",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-[#0a0a15] py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">Como funciona</p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Do tema ao post publicado
            <br />
            <span className="text-white/40">em 3 passos simples</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-1/2 top-12 hidden h-[calc(100%-96px)] w-px -translate-x-1/2 bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-pink-500/50 lg:block" />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Content */}
                <div className="flex-1 lg:text-right" style={{ textAlign: i % 2 === 1 ? "left" : undefined }}>
                  <div className={`inline-flex items-center gap-2 mb-4 ${i % 2 === 1 ? "" : "lg:justify-end lg:flex-row-reverse"}`}>
                    <span className="text-5xl font-black text-white/5">{step.num}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60 text-lg leading-relaxed max-w-md" style={{ marginLeft: i % 2 === 1 ? 0 : "auto" }}>
                    {step.description}
                  </p>
                </div>

                {/* Icon center */}
                <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br border border-white/10 shadow-2xl mx-auto lg:mx-0" style={{ backgroundImage: `linear-gradient(135deg, ${step.color.includes("indigo") ? "#4f46e5, #6366f1" : step.color.includes("purple") ? "#7c3aed, #8b5cf6" : "#db2777, #ec4899"})` }}>
                  <step.icon className="h-9 w-9 text-white" />
                </div>

                {/* Empty flex */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
