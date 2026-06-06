import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";

const plans = [
  { id: "free", name: "Free", price: "Grátis", features: ["3 carrosséis/mês", "7 slides por carrossel", "Export PNG com marca d'água", "Histórico 7 dias"] },
  { id: "pro", name: "Pro", price: "R$ 37/mês", features: ["30 carrosséis/mês", "15 slides por carrossel", "Export PNG + PDF sem marca d'água", "Perfis de marca", "Calendário editorial", "Suporte por e-mail"], highlight: true },
  { id: "business", name: "Business", price: "R$ 97/mês", features: ["Carrosséis ilimitados", "20 slides por carrossel", "Temas customizados ilimitados", "Histórico ilimitado", "Múltiplos perfis de marca", "Suporte prioritário"] },
];

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user!.id).single();
  const currentPlan = profile?.plan ?? "free";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
          <Link href="/settings"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Planos e faturamento</h1>
          <p className="text-white/40 text-sm">Plano atual: <span className="text-white capitalize font-medium">{currentPlan}</span></p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-2xl border p-6 ${plan.highlight ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/10 bg-white/[0.02]"} ${currentPlan === plan.id ? "ring-2 ring-indigo-500" : ""}`}>
            {currentPlan === plan.id && (
              <span className="inline-block mb-3 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Plano atual</span>
            )}
            <h3 className="font-bold text-white text-lg">{plan.name}</h3>
            <p className="text-2xl font-black text-white mt-2 mb-4">{plan.price}</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="h-4 w-4 text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === plan.id ? (
              <Button variant="outline" size="sm" className="w-full border-white/10 text-white/50" disabled>Plano ativo</Button>
            ) : (
              <Button variant={plan.highlight ? "gradient" : "outline"} size="sm" className={`w-full ${!plan.highlight ? "border-white/10 text-white hover:bg-white/5" : ""}`}>
                {currentPlan === "free" ? `Assinar ${plan.name}` : plan.id === "free" ? "Fazer downgrade" : `Mudar para ${plan.name}`}
              </Button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center mt-8 text-sm text-white/30">
        Pagamento processado com segurança via Stripe. Cancele quando quiser.
      </p>
    </div>
  );
}
