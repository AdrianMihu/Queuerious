import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/supabase/stripe/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature error:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.userId;
    const tokens = Number(session.metadata?.tokens ?? 0);

    if (userId && tokens > 0) {
      const { data, error } = await supabaseAdmin.rpc(
        "add_purchased_queue_tokens",
        {
          p_user_id: userId,
          p_tokens: tokens,
        }
      );

      if (error) {
        console.error("Token delivery error:", error);
        return new NextResponse("Failed to add tokens", { status: 500 });
      }

      console.log("PURCHASE TOKENS ADDED:", data);
    }
  }

  return NextResponse.json({ received: true });
}