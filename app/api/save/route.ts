import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // change this if your createClient lives elsewhere

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const form = await req.formData();
  const entry_date = String(form.get("entry_date") || "");
  const mood = String(form.get("mood") || "");
  const content = String(form.get("content") || "").trim();

  if (!entry_date || !content) {
    return NextResponse.redirect(new URL("/today", req.url));
  }

  const { error } = await supabase.from("journal_entries").upsert(
    {
      user_id: user.id,
      entry_date,
      mood: mood || null,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,entry_date" }
  );

  if (error) {
    return NextResponse.redirect(new URL("/today?error=save_failed", req.url));
  }

  return NextResponse.redirect(new URL("/today", req.url));
}
