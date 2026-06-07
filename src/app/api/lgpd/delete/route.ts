import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Registra a solicitação de exclusão — não exclui imediatamente (30 dias para reversão)
  const deletionScheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 dias

  const { error } = await supabase.from("profiles").update({
    lgpd_deletion_requested_at: new Date().toISOString(),
    lgpd_deletion_scheduled_at: deletionScheduledAt.toISOString(),
  }).eq("id", user.id);

  if (error) return NextResponse.json({ error: "Erro ao registrar solicitação" }, { status: 500 });

  // TODO: enviar e-mail de confirmação ao usuário
  // TODO: agendar job de exclusão via Supabase Edge Functions + pg_cron

  return NextResponse.json({
    success: true,
    message: "Solicitação registrada. Seus dados serão excluídos em 30 dias.",
    scheduledAt: deletionScheduledAt.toISOString(),
  });
}
