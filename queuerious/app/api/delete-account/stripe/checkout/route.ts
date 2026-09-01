import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../../lib/supabase/stripe/stripe";

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
    priceId: process.env.STRIPE_PRICE_QUEUENQUISTADOR!,
    type: "tokens",
    tokens: 50,
  },

  beyond: {
    priceId: process.env.STRIPE_PRICE_BEYOND!,
    type: "subscription",
  },

  mind: {
    priceId: process.env.STRIPE_PRICE_MIND!,
    type: "subscription",
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productKey = body.product as ProductKey;
    const userId = body.userId as string;

    if (!productKey || !PRODUCTS[productKey]) {
      return NextResponse.json(
        { error: "Invalid product." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const product = PRODUCTS[productKey];

    const origin =
      request.headers.get("origin") ||
      new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode:
        product.type === "subscription"
          ? "subscription"
          : "payment",

      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],

      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,

      metadata: {
        userId,
        product: productKey,
        tokens: product.type === "tokens"
          ? String(product.tokens)
          : "0",
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