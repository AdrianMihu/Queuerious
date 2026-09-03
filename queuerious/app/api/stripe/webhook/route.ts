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
    const stripeSubscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    const userId = session.metadata?.userId;
    const tokens = Number(session.metadata?.tokens ?? 0);
    const product = session.metadata?.product;

    if ((product === "beyond" || product === "mind") && !stripeSubscriptionId) {
      return new NextResponse("Missing Stripe subscription ID", {
        status: 500,
      });
    }

    const replacesSubscriptionId =
      session.metadata?.replacesSubscriptionId || null;

    if (product === "beyond" || product === "mind") {
      const startedAt = new Date();

      const stripeSubscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId!
      );

      const currentPeriodEnd =
        stripeSubscription.items.data[0]?.current_period_end;

      if (!currentPeriodEnd) {
        return new NextResponse("Missing subscription period end", {
          status: 500,
        });
      }

      const expiresAt = new Date(currentPeriodEnd * 1000);

      if (replacesSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(replacesSubscriptionId);
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", replacesSubscriptionId);

          console.log("OLD SUBSCRIPTION REPLACED:", replacesSubscriptionId);
        } catch (error) {
          console.error("Failed to replace old subscription:", error);

          return new NextResponse("Failed to replace existing membership", {
            status: 500,
          });
        }
      }

      const { error } = await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: product,
          status: "active",
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          cancelled_at: null,
          updated_at: startedAt.toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) {
        console.error("Subscription activation error:", error);
        return new NextResponse("Failed to activate subscription", {
          status: 500,
        });
      }

      console.log("SUBSCRIPTION ACTIVATED:", product, userId);
    }

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

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;

    const stripeSubscriptionId =
      invoice.parent?.type === "subscription_details"
        ? invoice.parent.subscription_details?.subscription
        : null;

    if (stripeSubscriptionId) {
      const subscriptionId =
        typeof stripeSubscriptionId === "string"
          ? stripeSubscriptionId
          : stripeSubscriptionId.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

      if (!currentPeriodEnd) {
        console.error("Missing subscription period end.");
        return new NextResponse("Missing subscription period end", {
          status: 500,
        });
      }

      const expiresAt = new Date(currentPeriodEnd * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          expires_at: expiresAt,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", stripeSubscriptionId);

      if (error) {
        console.error("Subscription renewal update error:", error);
        return new NextResponse("Failed to update subscription renewal", {
          status: 500,
        });
      }

      console.log("SUBSCRIPTION RENEWED:", stripeSubscriptionId, expiresAt);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Subscription expiration update error:", error);
      return new NextResponse("Failed to update subscription", {
        status: 500,
      });
    }

    console.log("SUBSCRIPTION EXPIRED:", subscription.id);
  }

  return NextResponse.json({ received: true });
}
