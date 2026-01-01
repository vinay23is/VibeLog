import { createClient } from "@/lib/supabase/server";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-2xl font-extrabold tracking-tight">VibeLog ✨</div>
          <div className="mt-2 opacity-80">Sign in to write your daily journal.</div>
          <a className="mt-4 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-black" href="/sign-in">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const date = todayISO();

  const { data: entry } = await supabase
    .from("journal_entries")
    .select("id, content, mood, updated_at")
    .eq("user_id", user.id)
    .eq("entry_date", date)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070A12] to-[#0B1020] text-white">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-2xl font-extrabold tracking-tight">VibeLog ✨</div>
          <div className="flex items-center gap-4">
            <a className="opacity-80 hover:opacity-100" href="/history">History</a>
            <a className="opacity-80 hover:opacity-100" href="/account">Account</a>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Today — {date}</div>
            <div className="text-xs opacity-70">
              {entry?.updated_at ? "saved" : "new"}
            </div>
          </div>

          <form id="saveForm" action="/api/save" method="POST" className="mt-4 space-y-3">
            <input type="hidden" name="entry_date" value={date} />

            <div className="flex gap-2">
              {["😄","😐","😭","😤","😴"].map(m => (
                <label key={m} className="cursor-pointer">
                  <input className="hidden" type="radio" name="mood" defaultChecked={entry?.mood === m} value={m} />
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 hover:bg-white/10">
                    {m}
                  </span>
                </label>
              ))}
            </div>

            <textarea
              name="content"
              defaultValue={entry?.content ?? ""}
              placeholder="dump thoughts here… no pressure 😮‍💨"
              className="w-full min-h-[340px] rounded-3xl border border-white/10 bg-black/30 p-4 outline-none focus:ring-2 focus:ring-white/20"
            />

            {/* ✅ updated button: disables nicely */}
            <button
              id="saveBtn"
              type="submit"
              className="rounded-3xl bg-white px-5 py-3 font-semibold text-black hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save / Publish
            </button>

            <div className="text-xs opacity-70">
              Tip: You can edit today anytime — saving updates the same entry.
            </div>
          </form>

          {/* ✅ prevents double submits without making this a client component */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  var form = document.getElementById('saveForm');
                  var btn = document.getElementById('saveBtn');
                  if (!form || !btn) return;
                  form.addEventListener('submit', function () {
                    btn.setAttribute('disabled', 'true');
                    btn.textContent = 'Saving…';
                  });
                })();
              `,
            }}
          />
        </div>
      </div>
    </div>
  );
}
