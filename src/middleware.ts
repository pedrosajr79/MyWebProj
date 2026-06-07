import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Simple in-process rate limiter (per-edge-instance) ──────────────────────
// For production scale, replace with Upstash Redis (free tier: upstash.com)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/ai/generate":    { max: 10,  windowMs: 60_000 },  // 10 req/min
  "/api/ai/review":      { max: 10,  windowMs: 60_000 },
  "/api/ai/viral":       { max: 5,   windowMs: 60_000 },  // busca externa + geração
  "/api/ai/":            { max: 30,  windowMs: 60_000 },  // outros endpoints AI
  "/api/publish/":       { max: 20,  windowMs: 60_000 },
  "/api/":               { max: 60,  windowMs: 60_000 },  // geral
  "/login":              { max: 10,  windowMs: 60_000 },  // anti-brute force
  "/register":           { max: 5,   windowMs: 60_000 },
};

function getRateLimit(pathname: string) {
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) return limit;
  }
  return null;
}

function checkRateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;
  if (entry.count > max) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: max - entry.count };
}

// ─── Middleware principal ────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting
  const rateConfig = getRateLimit(pathname);
  if (rateConfig) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "anonymous";
    const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;
    const { allowed, remaining } = checkRateLimit(key, rateConfig.max, rateConfig.windowMs);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Muitas requisições. Tente novamente em breve." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateConfig.windowMs / 1000)),
            "X-RateLimit-Limit": String(rateConfig.max),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Limpeza periódica do mapa (evita memory leak)
  if (rateLimitMap.size > 10_000) {
    const now = Date.now();
    for (const [k, v] of Array.from(rateLimitMap.entries())) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  // Supabase session refresh
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Proteção de rotas
  const protectedPaths = ["/dashboard", "/new", "/carousels", "/settings", "/publish", "/calendar", "/metrics"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Proteger /admin — validação mais aprofundada feita no layout
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
