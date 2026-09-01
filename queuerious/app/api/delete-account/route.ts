import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE() {
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

    const userId = user.id;

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
  FIND USER MATCHES
*/

const { data: matches, error: matchesError } = await adminSupabase
.from("matches")
.select("conversation_id")
.or(
  `user_one_id.eq.${userId},user_two_id.eq.${userId}`
);

if (matchesError) {
throw matchesError;
}

const conversationIds =
matches
  ?.map((match) => match.conversation_id)
  .filter(Boolean) ?? [];

/*
  DELETE CONVERSATION MESSAGES
*/

if (conversationIds.length > 0) {
    const { error: messagesError } = await adminSupabase
      .from("conversation_messages")
      .delete()
      .in("conversation_id", conversationIds);
  
    if (messagesError) {
      throw messagesError;
    }
  }

  /*
  DELETE CONVERSATIONS
*/

if (conversationIds.length > 0) {
    const { error: conversationsError } = await adminSupabase
      .from("queuemitment_conversations")
      .delete()
      .in("id", conversationIds);
  
    if (conversationsError) {
      throw conversationsError;
    }
  }

  /*
  DELETE MATCHES
*/

const { error: deleteMatchesError } = await adminSupabase
.from("matches")
.delete()
.or(
  `user_one_id.eq.${userId},user_two_id.eq.${userId}`
);

if (deleteMatchesError) {
throw deleteMatchesError;
}

    /*
  DELETE PROFILE
*/

const { error: profileError } = await adminSupabase
.from("profiles")
.delete()
.eq("id", userId);

if (profileError) {
throw profileError;
}

    /*
  DELETE PREFERENCES
*/

const { error: preferencesError } = await adminSupabase
  .from("preferences")
  .delete()
  .eq("id", userId);

if (preferencesError) {
throw preferencesError;
}

    /*
  DELETE QUEUE ENTRIES
*/

const { error: queueEntriesError } = await adminSupabase
.from("queue_entries")
.delete()
.eq("user_id", userId);

if (queueEntriesError) {
throw queueEntriesError;
}

    /*
  DELETE QUEUE TOKENS
*/

const { error: queueTokensError } = await adminSupabase
.from("queue_tokens")
.delete()
.eq("user_id", userId);

if (queueTokensError) {
throw queueTokensError;
}

/*
  DELETE AUTH USER
*/

const { error: deleteUserError } =
  await adminSupabase.auth.admin.deleteUser(userId);

if (deleteUserError) {
  throw deleteUserError;
}

return NextResponse.json({
success: true,
});

} catch (error) {
    console.error("Delete account error:", error);
  
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}