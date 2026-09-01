import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const conversationId = body.conversationId;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversation ID" },
        { status: 400 }
      );
    }

    /*
      Find the conversation
    */

    const { data: conversation, error: conversationError } =
      await supabase
        .from("queuemitment_conversations")
        .select("user_one_id, user_two_id")
        .eq("id", conversationId)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json({
        success: true,
      });
    }

    /*
      Make sure this user belongs to it
    */

    if (
      conversation.user_one_id !== user.id &&
      conversation.user_two_id !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized for this conversation" },
        { status: 403 }
      );
    }

    /*
      Delete BOTH matched queue entries.

      This destroys the abandoned match completely,
      allowing both users to enter the queue again
      as fresh sessions.
    */

    const { error: queueError } = await supabase
      .from("queue_entries")
      .delete()
      .eq("conversation_id", conversationId);

    if (queueError) {
      throw queueError;
    }

    /*
      Delete the abandoned conversation
    */

    const { error: deleteConversationError } =
      await supabase
        .from("queuemitment_conversations")
        .delete()
        .eq("id", conversationId);

    if (deleteConversationError) {
      throw deleteConversationError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Cancel conversation error:", error);

    return NextResponse.json(
      { error: "Failed to cancel conversation" },
      { status: 500 }
    );
  }
}