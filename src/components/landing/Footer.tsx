import Link from "next/link";
import { Zap, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a15] py-16">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              Carrosseiro
            </Link>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              A plataforma mais completa para criar carrosséis virais para o Instagram com Inteligência Artificial.
            </p>
            <div className="flex gap-4 mt-6">
              {[ExternalLink, ExternalLink, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {["Funcionalidades", "Planos", "Como funciona", "Blog"].map(t => (
                <li key={t}><a href="#" className="hover:text-white transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {["Termos de Uso", "Privacidade", "Cookies", "Contato"].map(t => (
                <li key={t}><a href="#" className="hover:text-white transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/30">© 2025 Carrosseiro. Todos os direitos reservados.</p>
          <p className="text-sm text-white/30">Feito com ❤️ para criadores de conteúdo brasileiros</p>
        </div>
      </div>
    </footer>
  );
}
