import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProviderId } from "@/lib/ai/router";
import { PROVIDER_METADATA, isProviderConfigured } from "@/lib/ai/router";

const TEST_SYSTEM = "Você é um assistente útil. Responda sempre em JSON.";
const TEST_USER = 'Retorne apenas: {"status":"ok","message":"Conexão bem sucedida"}';

export async function POST(req: NextRequest) {
  // Require authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { providerId?: string };
  const providerId = body.providerId as ProviderId | undefined;

  if (!providerId || !(providerId in PROVIDER_METADATA)) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 });
  }

  if (!isProviderConfigured(providerId)) {
    return NextResponse.json({
      success: false,
      error: `API key (${PROVIDER_METADATA[providerId].envKey}) não configurada`,
    });
  }

  try {
    let result: string;

    switch (providerId) {
      case "anthropic": {
        const { anthropicProvider } = await import("@/lib/ai/providers/anthropic");
        result = await anthropicProvider.generate(TEST_SYSTEM, TEST_USER, 64);
        break;
      }
      case "openai": {
        const { openaiProvider } = await import("@/lib/ai/providers/openai");
        result = await openaiProvider.generate(TEST_SYSTEM, TEST_USER, 64);
        break;
      }
      case "groq": {
        const { groqProvider } = await import("@/lib/ai/providers/groq");
        result = await groqProvider.generate(TEST_SYSTEM, TEST_USER, 64);
        break;
      }
      case "gemini": {
        const { geminiProvider } = await import("@/lib/ai/providers/gemini");
        result = await geminiProvider.generate(TEST_SYSTEM, TEST_USER, 64);
        break;
      }
      case "cohere": {
        const { cohereProvider } = await import("@/lib/ai/providers/cohere");
        result = await cohereProvider.generate(TEST_SYSTEM, TEST_USER, 64);
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    return NextResponse.json({ success: true, response: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message });
  }
}
