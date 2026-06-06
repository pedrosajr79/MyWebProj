import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { carousel_id, connection_id, caption, hashtags, scheduled_at } = body;

    if (!connection_id) {
      return NextResponse.json({ error: "Conexão obrigatória" }, { status: 400 });
    }

    // Verify the connection belongs to this user
    const { data: connection, error: connErr } = await supabase
      .from("social_connections")
      .select("id, platform, is_active")
      .eq("id", connection_id)
      .eq("user_id", user.id)
      .single();

    if (connErr || !connection) {
      return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 });
    }

    if (!connection.is_active) {
      return NextResponse.json({ error: "Conexão inativa. Reconecte a rede social." }, { status: 400 });
    }

    const status = scheduled_at ? "scheduled" : "publishing";

    const { data: post, error } = await supabase
      .from("social_posts")
      .insert({
        user_id: user.id,
        carousel_id: carousel_id ?? null,
        connection_id,
        platform: connection.platform,
        status,
        caption: caption ?? null,
        hashtags: hashtags ?? [],
        scheduled_at: scheduled_at ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[publish/schedule] DB error:", error);
      return NextResponse.json({ error: "Erro ao salvar agendamento" }, { status: 500 });
    }

    // TODO: If status === "publishing" (post now), trigger the real publishing flow here.
    // For MVP this just saves to the DB. A Supabase Edge Function with pg_cron
    // should poll for status='scheduled' rows whose scheduled_at <= NOW() and
    // call the Instagram Graph API / platform API to publish.

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    console.error("[publish/schedule]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "20");

    const { data: posts, error } = await supabase
      .from("social_posts")
      .select(`
        *,
        social_connections(account_name, platform),
        carousels(title, topic)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
    }

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("[publish/schedule GET]", err);
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

    const { error } = await supabase
      .from("social_posts")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "scheduled");

    if (error) {
      return NextResponse.json({ error: "Erro ao cancelar post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[publish/schedule DELETE]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
