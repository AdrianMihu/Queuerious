import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/supabase/stripe/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscription ID." },
        { status: 400 }
      );
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Supabase cancellation update error:", error);
      return NextResponse.json(
        { error: "Failed to update subscription." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    return NextResponse.json(
      { error: "Unable to cancel subscription." },
      { status: 500 }
    );
  }
}