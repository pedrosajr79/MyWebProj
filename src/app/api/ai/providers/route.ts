import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProviderStatuses } from "@/lib/ai/router";

export async function GET() {
  // Require authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = getProviderStatuses();
  return NextResponse.json({ providers });
}
