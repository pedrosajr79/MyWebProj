import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: connections, error } = await supabase
      .from("social_connections")
      .select("id, platform, account_name, account_id, is_active, token_expires_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar conexões" }, { status: 500 });
    }

    return NextResponse.json({ connections: connections ?? [] });
  } catch (err: unknown) {
    console.error("[publish/connections GET]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Soft-delete: mark as inactive (preserves history of linked posts)
    const { error } = await supabase
      .from("social_connections")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Erro ao desconectar rede" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[publish/connections DELETE]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// TODO: OAuth callback endpoint for real platform connections.
// When Instagram/Facebook OAuth flow completes it will redirect to:
//   /api/publish/connections/callback?platform=instagram&code=...
// That endpoint should exchange the code for access/refresh tokens using the
// Instagram Basic Display API or Meta Graph API, then upsert into social_connections.
// See: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started
