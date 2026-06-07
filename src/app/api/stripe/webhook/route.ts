import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

const PLAN_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? ""]: "pro",
  [process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? ""]: "business",
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = PLAN_BY_PRICE[priceId] ?? "free";
      const isActive = sub.status === "active" || sub.status === "trialing";
      await supabase.from("profiles").update({
        plan: isActive ? plan : "free",
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
      }).eq("id", userId);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await supabase.from("profiles").update({
        plan: "free",
        subscription_status: "cancelled",
      }).eq("id", userId);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as { subscription?: string }).subscription;
      if (!subId) break;
      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await supabase.from("profiles").update({ subscription_status: "active" }).eq("id", userId);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as { subscription?: string }).subscription;
      if (!subId) break;
      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;
      await supabase.from("profiles").update({ subscription_status: "past_due" }).eq("id", userId);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// Desabilitar parsing automático do body — necessário para validação da assinatura Stripe
export const runtime = "nodejs";
