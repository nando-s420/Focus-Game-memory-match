# Focus Games — Memory Match

A tiny web app that helps people train their attention span with a timed memory-matching
game. Every round must be finished in one sitting — if you leave or refresh, it resets,
which is the whole point (no cheating your attention span).

**Live app:** *(https://focus-game-memory-match.vercel.app/)*
**Test credentials:** *(add an email/password here after you create one — see Step 5)*

\---

## What's inside (mapped to the assignment brief)

|Requirement|Where it lives|
|-|-|
|**Authentication**|`index.html` + `js/auth.js` — sign up, log in, log out, all via Supabase Auth (email + password)|
|**CRUD** on the core entity (`attempts` = a completed round)|**Create**: saved automatically when you finish a round (`js/game.js`). **Read**: history table on the dashboard (`js/dashboard.js`). **Update**: edit the "note" on any past round. **Delete**: delete a round from your history.|
|**Core business flow**|Log in → Dashboard → Play Memory Match → finish the round in one sitting → result auto-saves → see it appear in your history, with your best time/moves updated.|

## Tech stack

* **Frontend:** plain HTML/CSS/JavaScript — no framework, no build step. Easiest thing to
explain in a video and deploys as-is.
* **Backend:** [Supabase](https://supabase.com) — a hosted Postgres database with built-in
authentication. It plays the role of "MS Excel but with real login and security": one
table (`attempts`), one row per completed round, protected so each user can only see
and edit their own rows (Postgres Row Level Security).
* **Hosting:** Vercel, connected directly to this GitHub repo (auto-deploys on every push).

There is no separate Node/Express server — the frontend talks to Supabase directly using
its public JS SDK, which is the standard, secure way to use Supabase (the "anon" key is
meant to be public; the database itself is what's locked down, via the RLS policies in
`sql/schema.sql`).

\---

## Setup instructions

### Step 1 — Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (you can use your GitHub account).
2. Click **New project**. Pick any name/region, set a database password (you won't need
it again — Supabase manages it), and wait \~2 minutes for it to spin up.

### Step 2 — Create the database table

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `sql/schema.sql` from this repo, copy all of it, paste it in, and click **Run**.
3. You should see "Success. No rows returned." That means the `attempts` table and its
security policies were created.

### Step 3 — Turn off email confirmation (so sign-up is instant for testing/grading)

1. In Supabase: **Authentication** → **Sign In / Providers** (or **Providers** → **Email**,
the exact label can vary slightly by Supabase version).
2. Find **Confirm email** and turn it **off**. This lets people log in immediately after
signing up, with no email step — much smoother for a demo or for an evaluator testing
your app.

### Step 4 — Connect the app to your Supabase project

1. In Supabase: **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/config.js` in this repo and paste them in:

```js
   const SUPABASE\_URL = "https://yjdqysbndrqaknhvbtlw.supabase.co";
   const SUPABASE\_ANON\_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZHF5c2JuZHJxYWtuaHZidGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzg0ODEsImV4cCI6MjEwMzc1NDQ4MX0.ARrl5IbtCALlzajxV1t239664Iqu9Cf2OZiKLroinzI";

&#x20;  ```

### Step 5 — Push to GitHub

If you're comfortable with git:

```bash
git init
git add .
git commit -m "Focus Games — memory match app"
git branch -M main
git remote add origin https://github.com/YOUR\_USERNAME/YOUR\_REPO\_NAME.git
git push -u origin main
```

If you'd rather not use git at all: create a new **public** repository on GitHub
(github.com → New repository), then on the repo page click **Add file → Upload files**
and drag in every file/folder from this project. Commit directly to `main`.

Make the repo **public** so the evaluator can see it without needing access granted.

### Step 6 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with your GitHub account.
2. Click **Add New… → Project**, then **Import** the GitHub repo you just created.
3. Leave all settings as default (it's a static site — Vercel needs no build command or
framework preset). Click **Deploy**.



### Step 7 — Create a test account for the evaluator

Open your live URL, sign up with something like `test@example.com` / `password123`, play
one round so there's data to see, then write those credentials at the top of this README
(and in your submission form) as the test login.

\---

## Running it locally (optional)

Because it's plain static files, you can just open `index.html` in a browser — but a tiny
local server avoids any file:// quirks:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit the printed local address. (You still need Steps 1–4 done first, since it
talks to your live Supabase project either way.)

## Project structure

```
attention-games/
├── index.html          # login / sign up
├── dashboard.html       # history, stats, "Play" button
├── game.html            # the Memory Match game itself
├── css/style.css
├── js/
│   ├── config.js         # <- your Supabase URL + anon key go here
│   ├── supabaseClient.js
│   ├── auth.js
│   ├── dashboard.js
│   └── game.js
└── sql/schema.sql        # run this once in Supabase's SQL editor
```

## Troubleshooting

* **Nothing happens when I click Log in / Sign up:** open the browser console (F12) —
almost always it's `js/config.js` still having the placeholder values from Step 4.
* **"Email not confirmed" error on login:** you skipped Step 3, or created the account
before turning confirmation off. Either confirm via the email Supabase sent, or delete
the user in Supabase (**Authentication → Users**) and sign up again.
* **History table is empty after finishing a round:** open the browser console for an
error from Supabase — it's almost always the RLS policies not applied (redo Step 2).

