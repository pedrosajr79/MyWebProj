import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";

interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountName?: string;
  accountId?: string;
}

async function exchangeMetaCode(code: string, platform: Platform): Promise<TokenResult> {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${APP_URL}/api/publish/connections/callback?platform=${platform}`;

  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(tokenData.error?.message ?? "Falha ao obter token Meta");

  // Get user info
  const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${tokenData.access_token}`);
  const meData = await meRes.json();

  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
    accountName: meData.name,
    accountId: meData.id,
  };
}

async function exchangeLinkedInCode(code: string): Promise<TokenResult> {
  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
  const redirectUri = `${APP_URL}/api/publish/connections/callback?platform=linkedin`;

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(tokenData.error_description ?? "Falha ao obter token LinkedIn");

  const meRes = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const meData = await meRes.json();

  return {
    accessToken: tokenData.access_token,
    expiresIn: tokenData.expires_in,
    accountName: `${meData.localizedFirstName} ${meData.localizedLastName}`,
    accountId: meData.id,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const platform = searchParams.get("platform") as Platform | null;
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(`${APP_URL}/publish?error=oauth_denied`);
  }

  if (!code || !state || !platform) {
    return NextResponse.redirect(`${APP_URL}/publish?error=oauth_invalid`);
  }

  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
    if (!userId) throw new Error("userId ausente");
  } catch {
    return NextResponse.redirect(`${APP_URL}/publish?error=oauth_state_invalid`);
  }

  const supabase = createServiceClient();

  try {
    let result: TokenResult;

    switch (platform) {
      case "instagram":
      case "facebook":
        result = await exchangeMetaCode(code, platform);
        break;
      case "linkedin":
        result = await exchangeLinkedInCode(code);
        break;
      default:
        return NextResponse.redirect(`${APP_URL}/publish?error=platform_not_supported`);
    }

    const expiresAt = result.expiresIn
      ? new Date(Date.now() + result.expiresIn * 1000).toISOString()
      : null;

    // Upsert connection (one per user+platform)
    await supabase.from("social_connections").upsert(
      {
        user_id: userId,
        platform,
        account_name: result.accountName ?? null,
        account_id: result.accountId ?? null,
        access_token: result.accessToken,
        refresh_token: result.refreshToken ?? null,
        token_expires_at: expiresAt,
        is_active: true,
      },
      { onConflict: "user_id,platform" }
    );

    return NextResponse.redirect(`${APP_URL}/publish?connected=${platform}`);
  } catch (err) {
    console.error("[oauth/callback]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.redirect(`${APP_URL}/publish?error=${encodeURIComponent(msg)}`);
  }
}
