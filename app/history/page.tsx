import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <a href="/sign-in">Sign in</a>;

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("entry_date, mood, content, updated_at")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(90);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-extrabold tracking-tight">History</div>
          <a className="opacity-80 hover:opacity-100" href="/today">Today</a>
        </div>

        <div className="mt-5 space-y-3">
          {(entries ?? []).map(e => (
            <a
              key={e.entry_date}
              href={`/entry/${e.entry_date}`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">
                  {e.entry_date} <span className="ml-2">{e.mood ?? ""}</span>
                </div>
                <div className="text-xs opacity-70">open</div>
              </div>
              <div className="mt-2 opacity-80">
                {(e.content ?? "").slice(0, 140)}{(e.content ?? "").length > 140 ? "…" : ""}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
