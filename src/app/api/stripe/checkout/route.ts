import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
}

const PLAN_PRICES: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  business: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { plan } = await req.json() as { plan: string };
    const priceId = PLAN_PRICES[plan];
    if (!priceId) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    const stripe = getStripe();

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        name: profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings/billing?success=1`,
      cancel_url: `${appUrl}/settings/billing?cancelled=1`,
      subscription_data: { metadata: { supabase_user_id: user.id, plan } },
      allow_promotion_codes: true,
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[stripe/checkout]", err);
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
