import { Sparkles, ImageIcon, UserCircle, FolderOpen, CalendarDays, Download, Palette, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Geração de texto persuasivo",
    description: "A IA escreve cada slide com copy que prende a atenção, gera curiosidade e converte seguidores em clientes.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: ImageIcon,
    title: "Imagens IA integradas",
    description: "Gere imagens únicas para seus slides — sem sair da plataforma, sem custos extras.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: UserCircle,
    title: "Perfis de marca",
    description: "Configure sua identidade visual uma vez. A IA aplica automaticamente em todos os carrosséis que você criar.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: FolderOpen,
    title: "Organização em pastas",
    description: "Categorize e encontre qualquer carrossel instantaneamente, mesmo com centenas de posts salvos.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: CalendarDays,
    title: "Calendário editorial",
    description: "Visualize e organize toda a sua estratégia de conteúdo em um único lugar, mês a mês.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Download,
    title: "Export pronto para publicar",
    description: "Baixe os slides em alta resolução, formatados perfeitamente para o feed e stories do Instagram.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Palette,
    title: "Temas e estilos visuais",
    description: "Escolha entre dezenas de temas profissionais ou crie o seu com as cores e fontes da sua marca.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Zap,
    title: "Geração em menos de 30s",
    description: "De zero a carrossel completo em menos de 30 segundos. Poste toda semana sem esforço.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="bg-[#080810] py-24">
      <div className="container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">Funcionalidades</p>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Tudo que você precisa para
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              dominar o Instagram
            </span>
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">
            Uma plataforma completa para criadores de conteúdo que querem crescer sem perder horas criando posts.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} mb-4`}>
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
