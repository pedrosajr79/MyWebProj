import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Coleta todos os dados do usuário
  const [profileRes, carouselsRes, connectionsRes, postsRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, plan, created_at, lgpd_consent_at").eq("id", user.id).single(),
    supabase.from("carousels").select("id, title, topic, tone, slide_count, status, created_at").eq("user_id", user.id),
    supabase.from("social_connections").select("platform, account_name, is_active, created_at").eq("user_id", user.id),
    supabase.from("social_posts").select("platform, status, caption, scheduled_at, published_at, created_at").eq("user_id", user.id),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    requestedBy: user.email,
    legalBasis: "LGPD Art. 18, V — Direito à portabilidade",
    profile: profileRes.data,
    carousels: carouselsRes.data ?? [],
    socialConnections: connectionsRes.data ?? [],
    scheduledPosts: postsRes.data ?? [],
    notice: "Este arquivo contém seus dados pessoais armazenados na plataforma Carrosseiro. Senhas e tokens de acesso não são incluídos por razões de segurança.",
  };

  // Registra auditoria
  await supabase.from("profiles")
    .update({ lgpd_data_export_requested_at: new Date().toISOString() })
    .eq("id", user.id);

  const json = JSON.stringify(exportData, null, 2);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="carrosseiro-dados-${user.id}.json"`,
    },
  });
}
