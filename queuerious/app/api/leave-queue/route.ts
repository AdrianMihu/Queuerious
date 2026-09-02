import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST() {

    
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc(
      "leave_queuemitment"
    );

    if (error) {
      console.error("Leave queue error:", error);

      return NextResponse.json(
        { error: "Failed to leave queue" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Leave queue API error:", error);

    return NextResponse.json(
      { error: "Failed to leave queue" },
      { status: 500 }
    );
  }
}