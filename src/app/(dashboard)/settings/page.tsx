import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, User } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-indigo-400" />
          <h2 className="font-semibold text-white">Perfil</h2>
        </div>
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/40">Nome</dt>
            <dd className="text-white">{profile?.full_name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/40">E-mail</dt>
            <dd className="text-white">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/40">Plano atual</dt>
            <dd className="text-white capitalize font-semibold">{profile?.plan ?? "free"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="font-semibold text-white">Plano e faturamento</h2>
              <p className="text-sm text-white/40">Gerencie sua assinatura</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
            <Link href="/settings/billing">Gerenciar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
