import { createClient } from "@/lib/supabase/server";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <a href="/sign-in">Sign in</a>;

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("entry_date, mood, content, updated_at")
    .eq("user_id", user.id)
    .eq("entry_date", date)
    .maybeSingle();

  if (!entry) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="font-semibold">No entry for that date.</div>
          <a
            className="mt-3 inline-block opacity-80 hover:opacity-100"
            href="/history"
          >
            Back to history
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
      <div className="mx-auto max-w-3xl p-6">
        <a className="opacity-80 hover:opacity-100" href="/history">
          ← Back
        </a>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-xl font-extrabold tracking-tight">
            {entry.entry_date} <span className="ml-2">{entry.mood ?? ""}</span>
          </div>
          <div className="mt-1 text-xs opacity-70">
            Last updated: {entry.updated_at ? new Date(entry.updated_at).toLocaleString() : "—"}
          </div>

          <pre className="mt-4 whitespace-pre-wrap leading-7 opacity-90">
            {entry.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
