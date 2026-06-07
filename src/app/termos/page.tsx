import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — Carrosseiro",
  description: "Termos e condições de uso da plataforma Carrosseiro.",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a15]">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-white w-fit">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Carrosseiro
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Termos de Uso</h1>
        <p className="text-white/40 mb-12">Última atualização: 07 de junho de 2026</p>

        <div className="space-y-8">
          {[
            {
              title: "1. Aceitação",
              content: "Ao criar uma conta ou usar a plataforma Carrosseiro, você concorda com estes Termos. Se não concordar, não utilize o serviço.",
            },
            {
              title: "2. Descrição do serviço",
              content: "O Carrosseiro é uma plataforma SaaS que permite criar carrosséis para Instagram usando Inteligência Artificial. O serviço é oferecido 'como está', com disponibilidade de 99% (SLA).",
            },
            {
              title: "3. Conta de usuário",
              content: "Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas na sua conta. Informe-nos imediatamente sobre uso não autorizado.",
            },
            {
              title: "4. Uso aceitável",
              content: "É proibido: (a) usar o serviço para gerar conteúdo ilegal, difamatório ou que viole direitos de terceiros; (b) fazer engenharia reversa da plataforma; (c) compartilhar credenciais de acesso; (d) usar automações não autorizadas; (e) sobrecarregar intencionalmente a infraestrutura.",
            },
            {
              title: "5. Conteúdo gerado",
              content: "Você retém todos os direitos sobre o conteúdo que cria usando a plataforma. Ao usar o serviço, você nos concede uma licença limitada para processar esse conteúdo para fins de prestação do serviço. Não utilizamos seu conteúdo para treinar modelos de IA.",
            },
            {
              title: "6. Planos e pagamentos",
              content: "Os planos pagos são cobrados mensalmente ou anualmente via Stripe. Cancelamentos são efetivados ao final do período já pago. Reembolsos são avaliados caso a caso em até 7 dias após a cobrança.",
            },
            {
              title: "7. Limitação de responsabilidade",
              content: "O Carrosseiro não se responsabiliza por: (a) perdas de dados decorrentes de falhas de terceiros; (b) conteúdo gerado pela IA que não atenda às suas expectativas; (c) interrupções de serviço de provedores externos (Supabase, OpenAI, etc.). Nossa responsabilidade total é limitada ao valor pago nos últimos 3 meses.",
            },
            {
              title: "8. Propriedade intelectual",
              content: "A plataforma Carrosseiro, seu design, código-fonte e marcas são de propriedade exclusiva do titular. É vedada a reprodução sem autorização.",
            },
            {
              title: "9. Rescisão",
              content: "Podemos suspender ou encerrar sua conta em caso de violação destes Termos, com notificação prévia quando possível. Você pode encerrar sua conta a qualquer momento em Configurações.",
            },
            {
              title: "10. Lei aplicável",
              content: "Estes Termos são regidos pela lei brasileira. Eventuais disputas serão resolvidas no foro da comarca de São Paulo/SP.",
            },
          ].map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
              <p className="text-white/70 leading-relaxed">{content}</p>
            </section>
          ))}

          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">
              Dúvidas sobre estes Termos?{" "}
              <a href="mailto:suporte@carrosseiro.com.br" className="text-indigo-400 hover:underline">suporte@carrosseiro.com.br</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
