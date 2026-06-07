import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isOwner } from "@/lib/admin";
import { routeGenerate } from "@/lib/ai/router";
import { RESEARCH_SYSTEM_PROMPT, buildResearchPrompt } from "@/lib/ai/prompts";

export async function POST() {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isOwner(user.email)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const serviceClient = createServiceClient();

  // Insert a pending record first
  const { data: record, error: insertError } = await serviceClient
    .from("admin_research")
    .insert({ triggered_by: user.email, status: "pending" })
    .select()
    .single();

  if (insertError || !record) {
    console.error("[admin/research] Insert error:", insertError);
    return NextResponse.json({ error: "Erro ao criar registro" }, { status: 500 });
  }

  try {
    const result = await routeGenerate(
      RESEARCH_SYSTEM_PROMPT,
      buildResearchPrompt(),
      4000
    );

    // Parse the JSON from the AI response
    let parsed: unknown;
    try {
      // Strip markdown code fences if the model wrapped the JSON
      const cleaned = result.text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`IA retornou JSON inválido: ${result.text.slice(0, 200)}`);
    }

    // Update the record to done
    await serviceClient
      .from("admin_research")
      .update({ status: "done", result: parsed })
      .eq("id", record.id);

    return NextResponse.json({
      id: record.id,
      status: "done",
      result: parsed,
      providerName: result.providerName,
      attemptCount: result.attemptCount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/research] AI error:", message);

    await serviceClient
      .from("admin_research")
      .update({ status: "error", result: { error: message } })
      .eq("id", record.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!isOwner(user.email)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from("admin_research")
    .select("id, triggered_by, status, created_at, result")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data });
}
