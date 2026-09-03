import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/supabase/stripe/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRODUCTS = {
  queuetie: {
    priceId: process.env.STRIPE_PRICE_QUEUETIE!,
    type: "tokens",
    tokens: 5,
  },

  queuemunication: {
    priceId: process.env.STRIPE_PRICE_QUEUEMUNICATION!,
    type: "tokens",
    tokens: 15,
  },

  queuenquistador: {
    priceId: process.env.STRIPE_PRICE_QUEENQUISTADOR!,
    type: "tokens",
    tokens: 50,
  },

  beyond: {
    priceId: process.env.STRIPE_PRICE_BEYOND!,
    type: "subscription",
    tokens: 5,
  },
  mind: {
    priceId: process.env.STRIPE_PRICE_MIND!,
    type: "subscription",
    tokens: 10,
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productKey = body.product as ProductKey;
    const userId = body.userId as string;

    if (!productKey || !PRODUCTS[productKey]) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const product = PRODUCTS[productKey];

    let replacesSubscriptionId: string | null = null;
    let currentSubscription: {
      plan: string;
      stripe_subscription_id: string | null;
    } | null = null;

    if (product.type === "subscription") {
      const { data } = await supabaseAdmin
        .from("subscriptions")
        .select("plan, stripe_subscription_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      currentSubscription = data;

      if (currentSubscription && currentSubscription.plan === productKey) {
        return NextResponse.json(
          { error: "You already have this membership active." },
          { status: 400 }
        );
      }

      if (
        currentSubscription &&
        currentSubscription.plan !== productKey &&
        currentSubscription.stripe_subscription_id
      ) {
        replacesSubscriptionId = currentSubscription.stripe_subscription_id;
      }
    }

    const origin = request.headers.get("origin") || new URL(request.url).origin;

    

    const session = await stripe.checkout.sessions.create({
      mode: product.type === "subscription" ? "subscription" : "payment",

      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],

      success_url: `${origin}/dashboard/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/store`,

      metadata: {
        userId,
        product: productKey,
        tokens: "tokens" in product ? String(product.tokens) : "0",
        replacesSubscriptionId: replacesSubscriptionId ?? "",
      },
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
