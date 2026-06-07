import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Platform = "instagram" | "facebook" | "linkedin" | "twitter" | "tiktok";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CALLBACK_URI = `${APP_URL}/api/publish/connections/callback`;

function buildOAuthUrl(platform: Platform, state: string): string | null {
  switch (platform) {
    case "instagram":
    case "facebook": {
      const appId = process.env.META_APP_ID;
      if (!appId) return null;
      const scope = "instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list";
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: `${CALLBACK_URI}?platform=${platform}`,
        scope,
        response_type: "code",
        state,
      });
      return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    }
    case "linkedin": {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (!clientId) return null;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: `${CALLBACK_URI}?platform=linkedin`,
        state,
        scope: "r_liteprofile r_emailaddress w_member_social",
      });
      return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    }
    case "twitter": {
      const clientId = process.env.TWITTER_CLIENT_ID;
      if (!clientId) return null;
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: `${CALLBACK_URI}?platform=twitter`,
        state,
        scope: "tweet.read tweet.write users.read offline.access",
        code_challenge: "challenge",
        code_challenge_method: "plain",
      });
      return `https://twitter.com/i/oauth2/authorize?${params}`;
    }
    case "tiktok": {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      if (!clientKey) return null;
      const params = new URLSearchParams({
        client_key: clientKey,
        response_type: "code",
        scope: "user.info.basic,video.upload",
        redirect_uri: `${CALLBACK_URI}?platform=tiktok`,
        state,
      });
      return `https://www.tiktok.com/auth/authorize/?${params}`;
    }
    default:
      return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { platform: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${APP_URL}/login`);

  const platform = params.platform as Platform;
  const validPlatforms: Platform[] = ["instagram", "facebook", "linkedin", "twitter", "tiktok"];
  if (!validPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Plataforma inválida" }, { status: 400 });
  }

  const state = Buffer.from(JSON.stringify({ userId: user.id, platform, ts: Date.now() })).toString("base64url");
  const oauthUrl = buildOAuthUrl(platform, state);

  if (!oauthUrl) {
    return NextResponse.redirect(
      `${APP_URL}/publish?error=oauth_not_configured&platform=${platform}`
    );
  }

  return NextResponse.redirect(oauthUrl);
}
