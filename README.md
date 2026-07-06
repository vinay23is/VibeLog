# VibeLog

A minimal daily journal app — one entry per day, a mood tag, and a history view — for anyone who wants a low-friction way to jot down how a day went without the overhead of a full journaling app.

**Live Demo:** [vibelog-snowy.vercel.app](https://vibelog-snowy.vercel.app)

## What problem does this solve?

Most journaling apps have too much ceremony (tags, rich text, folders) for someone who just wants to dump a paragraph about their day and mark a mood emoji. VibeLog strips that down to one page per day: open it, write, save — the same entry gets updated if you write again later that day. I built it to practice Supabase auth + Postgres from scratch on top of the official Next.js/Supabase starter, adding a real per-user data model (row-level entries, upsert semantics) instead of just the starter's demo tables.

## Tech Stack

- **Frontend:** Next.js (App Router), React 19, TailwindCSS, shadcn/ui
- **Backend/Auth:** Supabase Auth (`@supabase/ssr`, cookie-based sessions) + Supabase Postgres
- **Infra/Deployment:** Vercel

## Architecture

- **`journal_entries` table**, one row per `(user_id, entry_date)` — the app relies on a unique constraint on that pair so saving today's entry twice is an *upsert*, not a duplicate insert (`onConflict: "user_id,entry_date"` in `app/api/save/route.ts`).
- **`/today`** (`app/today/page.tsx`) is a server component that loads (or creates, on first save) today's entry for the logged-in user and renders a plain HTML `<form>` posting to `/api/save` — no client-side state library needed for the core write path.
- **`/api/save`** (`app/api/save/route.ts`) is a Route Handler that re-checks the authenticated user server-side before writing, so the write path isn't relying on trusting the client.
- **`/history`** lists a user's last 90 entries by date, each linking to **`/entry/[date]`**, a dynamic route that reads a single day's entry read-only.
- **`/account`** shows the logged-in user's email and a logout action, gated with a server-side `redirect("/auth/login")` if there's no session.
- Auth, session refresh, and protected-route patterns are inherited from the Next.js + Supabase starter template (`lib/supabase/client.ts` / `server.ts`, `proxy.ts`) — the same foundation as my `nextjs-with-supabase` repo, with the journaling features (`today`, `history`, `entry/[date]`, `account`, `api/save`) built on top.

## Key Features

- One entry per day, auto-created on first write, updated (not duplicated) on subsequent saves the same day
- Mood picker (5 emoji options) stored alongside the entry text
- History view of past entries with a preview snippet, newest first
- Per-day permalink (`/entry/[date]`) to view a single past entry
- Account page showing the signed-in user and a logout control
- Full Supabase email/password auth (sign up, login, forgot/update password) inherited from the starter template

## Interesting Engineering Decisions

- **Upsert on `(user_id, entry_date)` instead of a create-then-check flow** — the save endpoint always upserts, so "did I already write today?" is handled by the database's conflict resolution rather than an extra read-then-write round trip in application code.
- **Server-rendered form with no client JS framework for the save path** — `/today` posts a native form to a Route Handler and gets redirected back; a small inline `<script>` just disables the button on submit to prevent double-posts. It works without JavaScript enabled beyond that one guard.
- **Auth re-verified inside the API route, not just trusted from the page** — even though `/today` already checked for a logged-in user to render the form, `/api/save` independently calls `supabase.auth.getUser()` again before writing, so the write path doesn't assume the request came from the page it expects.

## Running Locally

```bash
git clone https://github.com/vinay23is/VibeLog.git
cd VibeLog
npm install
```

Create a Supabase project, then set up `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Create the `journal_entries` table in the Supabase SQL editor:
```sql
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  mood text,
  content text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);
```

```bash
npm run dev   # http://localhost:3000, redirects to /today
```
