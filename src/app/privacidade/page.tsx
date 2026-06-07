import Link from "next/link";
import { Zap, Shield } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade — Carrosseiro",
  description: "Como coletamos, usamos e protegemos seus dados pessoais de acordo com a LGPD.",
};

const UPDATED_AT = "07 de junho de 2026";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0a0a15]">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Carrosseiro
        </Link>
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Shield className="h-4 w-4" />
          LGPD Compliant
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidade</h1>
        <p className="text-white/40 mb-12">Última atualização: {UPDATED_AT}</p>

        <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-li:text-white/70 max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Quem somos</h2>
            <p className="text-white/70 leading-relaxed">
              O <strong className="text-white">Carrosseiro</strong> é uma plataforma SaaS de geração de carrosséis para Instagram com Inteligência Artificial, operada por Pedro Saraiva Júnior, CPF/CNPJ a informar, com sede no Brasil. Somos responsáveis pelo tratamento dos seus dados pessoais conforme a <strong className="text-white">Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>.
            </p>
            <p className="text-white/70 leading-relaxed mt-3">
              Contato do Encarregado de Dados (DPO): <a href="mailto:privacidade@carrosseiro.com.br" className="text-indigo-400 hover:underline">privacidade@carrosseiro.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados que coletamos</h2>
            <ul className="space-y-2 text-white/70">
              <li><strong className="text-white">Dados de cadastro:</strong> nome, endereço de e-mail, senha (armazenada com hash bcrypt via Supabase Auth)</li>
              <li><strong className="text-white">Dados de uso:</strong> carrosséis criados, temas utilizados, data e hora de acesso</li>
              <li><strong className="text-white">Dados de pagamento:</strong> processados exclusivamente pelo Stripe — não armazenamos dados de cartão</li>
              <li><strong className="text-white">Dados de navegação:</strong> endereço IP, tipo de navegador, páginas acessadas (logs de servidor)</li>
              <li><strong className="text-white">Conteúdo gerado:</strong> textos dos carrosséis que você cria na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidade e base legal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-3 text-white">Finalidade</th>
                    <th className="text-left p-3 text-white">Base legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Prestação do serviço (geração de carrosséis)", "Execução de contrato (Art. 7º, V)"],
                    ["Cobrança e faturamento", "Execução de contrato (Art. 7º, V)"],
                    ["Envio de e-mails transacionais", "Execução de contrato (Art. 7º, V)"],
                    ["Marketing e comunicações promocionais", "Consentimento (Art. 7º, I)"],
                    ["Prevenção de fraudes e segurança", "Legítimo interesse (Art. 7º, IX)"],
                    ["Cumprimento de obrigações legais", "Obrigação legal (Art. 7º, II)"],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="border-b border-white/5">
                      <td className="p-3 text-white/70">{fin}</td>
                      <td className="p-3 text-white/50">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Compartilhamento de dados</h2>
            <p className="text-white/70 leading-relaxed mb-3">Compartilhamos dados apenas com:</p>
            <ul className="space-y-2 text-white/70">
              <li><strong className="text-white">Supabase Inc.</strong> — banco de dados e autenticação (EUA, cláusulas contratuais padrão)</li>
              <li><strong className="text-white">Stripe Inc.</strong> — processamento de pagamentos (EUA, Privacy Shield)</li>
              <li><strong className="text-white">Provedores de IA</strong> — OpenAI, Anthropic, Google (EUA) — apenas o conteúdo do prompt enviado, sem dados pessoais identificáveis</li>
              <li><strong className="text-white">Vercel Inc.</strong> — hospedagem e CDN (EUA)</li>
            </ul>
            <p className="text-white/70 mt-3 leading-relaxed">Não vendemos dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Seus direitos (LGPD, Art. 18)</h2>
            <p className="text-white/70 mb-3">Você tem direito a:</p>
            <ul className="space-y-2 text-white/70">
              <li>✅ <strong className="text-white">Acesso:</strong> saber quais dados temos sobre você</li>
              <li>✅ <strong className="text-white">Correção:</strong> corrigir dados incompletos ou desatualizados</li>
              <li>✅ <strong className="text-white">Portabilidade:</strong> exportar seus dados em formato estruturado (JSON)</li>
              <li>✅ <strong className="text-white">Eliminação:</strong> solicitar a exclusão dos seus dados pessoais</li>
              <li>✅ <strong className="text-white">Revogação de consentimento:</strong> para comunicações de marketing</li>
              <li>✅ <strong className="text-white">Oposição:</strong> questionar tratamentos baseados em legítimo interesse</li>
            </ul>
            <p className="text-white/70 mt-4">
              Para exercer seus direitos, acesse <Link href="/settings" className="text-indigo-400 hover:underline">Configurações → Privacidade</Link> ou envie e-mail para <a href="mailto:privacidade@carrosseiro.com.br" className="text-indigo-400 hover:underline">privacidade@carrosseiro.com.br</a>. Responderemos em até <strong className="text-white">15 dias úteis</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Retenção de dados</h2>
            <ul className="space-y-2 text-white/70">
              <li>Dados de conta ativa: enquanto a conta existir</li>
              <li>Após exclusão da conta: dados anonimizados em até 30 dias; dados fiscais retidos por 5 anos (obrigação legal)</li>
              <li>Logs de segurança: 90 dias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Segurança</h2>
            <ul className="space-y-2 text-white/70">
              <li>Comunicações protegidas por TLS 1.3</li>
              <li>Senhas armazenadas com bcrypt (fator de custo 12)</li>
              <li>Row Level Security no banco de dados — cada usuário acessa apenas seus dados</li>
              <li>Tokens de sessão com rotação automática</li>
              <li>Auditorias de segurança periódicas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p className="text-white/70 leading-relaxed">Utilizamos cookies essenciais para autenticação e cookies analíticos (opt-in). Você pode gerenciar suas preferências no banner de cookies ou nas configurações do navegador.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Alterações nesta política</h2>
            <p className="text-white/70 leading-relaxed">Notificaremos por e-mail mudanças materiais com pelo menos 15 dias de antecedência. A versão vigente estará sempre disponível nesta página.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contato e ANPD</h2>
            <p className="text-white/70 leading-relaxed">
              Dúvidas: <a href="mailto:privacidade@carrosseiro.com.br" className="text-indigo-400 hover:underline">privacidade@carrosseiro.com.br</a><br />
              Reclamações podem ser enviadas à <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">ANPD (Autoridade Nacional de Proteção de Dados)</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
