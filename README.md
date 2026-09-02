Focus Games — Memory Match
A tiny web app that helps people train their attention span with a timed memory-matching
game. Every round must be finished in one sitting — if you leave or refresh, it resets,
which is the whole point (no cheating your attention span).
Live app: (focus-game-memory-match.vercel.app/dashboard.html)
Test credentials: (ID: test@example.com | Password: password123)
---
What's inside
Requirement	Where it lives
Authentication	`index.html` + `js/auth.js` — sign up, log in, log out, all via Supabase Auth (email + password). Plus password reset (`forgot-password.html` → email link → `reset-password.html`), which isn't in the brief but is a real gap worth closing.
CRUD on the core entity (`attempts` = a completed round)	Create: saved automatically when you finish a round (`js/game.js`). Read: history table on the dashboard (`js/dashboard.js`). Update: edit the reflection note on any past round. Delete: delete a round from your history.
Core business flow	Log in → Dashboard → pick a difficulty (a real decision — locked in once the round starts) → Play Memory Match → finish the round in one sitting → result auto-saves → see it appear in your history, with your best time/moves updated.
A note on "quality of business flow logic": the difficulty pick isn't cosmetic — it
sets the pair count the round must solve, and the database enforces that a saved attempt's
move count is consistent with the difficulty it claims (see the `check` constraints in
`sql/schema.sql`). That closes the obvious way someone could fake a result by writing
directly to the API instead of playing. It's not full anti-cheat (that would need a
server-side timer), but it's a deliberate, explainable scoping decision — worth saying so
in the video rather than leaving it unmentioned.
Tech stack
Frontend: plain HTML/CSS/JavaScript — no framework, no build step. Easiest thing to
explain in a video and deploys as-is.
Backend: Supabase — a hosted Postgres database with built-in
authentication. It plays the role of "MS Excel but with real login and security": one
table (`attempts`), one row per completed round, protected so each user can only see
and edit their own rows (Postgres Row Level Security).
Hosting: Vercel, connected directly to this GitHub repo (auto-deploys on every push).
There is no separate Node/Express server — the frontend talks to Supabase directly using
its public JS SDK, which is the standard, secure way to use Supabase (the "anon" key is
meant to be public; the database itself is what's locked down, via the RLS policies in
`sql/schema.sql`).
---
Setup instructions
Step 1 — Create a free Supabase project
Go to supabase.com → sign up (you can use your GitHub account).
Click New project. Pick any name/region, set a database password (you won't need
it again — Supabase manages it), and wait ~2 minutes for it to spin up.
Step 2 — Create the database table
In your Supabase project, open SQL Editor (left sidebar) → New query.
Open `sql/schema.sql` from this repo, copy all of it, paste it in, and click Run.
You should see "Success. No rows returned." That means the `attempts` table and its
security policies were created.
Step 3 — Turn off email confirmation (so sign-up is instant for testing/grading)
In Supabase: Authentication → Sign In / Providers (or Providers → Email,
the exact label can vary slightly by Supabase version).
Find Confirm email and turn it off. This lets people log in immediately after
signing up, with no email step — much smoother for a demo or for an evaluator testing
your app.
Step 4 — Connect the app to your Supabase project
In Supabase: Project Settings (gear icon) → API.
Copy the Project URL and the anon public key.
Open `js/config.js` in this repo and paste them in:
```js
   const SUPABASE_URL = "https://yjdqysbndrqaknhvbtlw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZHF5c2JuZHJxYWtuaHZidGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNzg0ODEsImV4cCI6MjEwMzc1NDQ4MX0.ARrl5IbtCALlzajxV1t239664Iqu9Cf2OZiKLroinzI";
   ```
Step 4.5 — Already had this table set up before? Run the migration
If you already ran the old `schema.sql` once (e.g. you had a working test account
before this update), don't re-run `schema.sql` — it would try to recreate the table.
Instead: SQL Editor → New query → paste in `sql/migration.sql` → Run. It updates your
existing table in place (adds the difficulty column + safety checks) without losing any
rounds you already saved.
Step 5 — Push to GitHub
If you're comfortable with git:
```bash
git init
git add .
git commit -m "Focus Games — memory match app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```
If you'd rather not use git at all: on the repo page click Add file → Upload files.
In File Explorer, select everything inside this project folder at once (Ctrl+A —
files and the `css`/`js`/`sql` folder icons together) and drag that whole selection onto
the upload box, then Commit changes. Dragging folder icons (not their contents) is
what keeps `css/` and `js/` as real subfolders on GitHub — if you open a folder and drag
just the files inside it, GitHub loses the folder structure and the site breaks (no
styling, buttons don't work) even though the page still loads.
Make the repo public so the evaluator can see it without needing access granted.
Step 6 — Deploy to Vercel
Go to vercel.com → sign up with your GitHub account.
Click Add New… → Project, then Import the GitHub repo you just created.
Leave all settings as default (it's a static site — Vercel needs no build command or
framework preset). Click Deploy.
After ~30 seconds you'll get a live URL like `your-repo.vercel.app`. Put that at the
top of this README and in your submission.
Step 7 — Allow your live URL to receive password-reset links
The app includes "Forgot password?" (`forgot-password.html` → email → `reset-password.html`).
Supabase sends that email itself — nothing extra to configure — but it will only redirect
back to your live site if that URL is on an allow-list:
In Supabase: Authentication → URL Configuration.
Set Site URL to your Vercel URL (e.g. `https://your-repo.vercel.app`).
Under Redirect URLs, add `https://your-repo.vercel.app/**` (the `/**` wildcard matters).
Save. Do this after Step 6, once you actually have your Vercel URL.
If you skip this, clicking the reset link in the email will bounce back to a generic
Supabase page instead of your `reset-password.html`.
Step 8 — Create a test account for the evaluator
Open your live URL, sign up with something like `test@example.com` / `password123`, play
one round so there's data to see, then write those credentials at the top of this README
(and in your submission form) as the test login.
---
Running it locally (optional)
Because it's plain static files, you can just open `index.html` in a browser — but a tiny
local server avoids any file:// quirks:
```bash
npx serve .
# or
python3 -m http.server 8000
```
Then visit the printed local address. (You still need Steps 1–4 done first, since it
talks to your live Supabase project either way.)
Project structure
```
attention-games/
├── index.html            # login / sign up
├── dashboard.html        # history, stats, "Play" button
├── game.html             # the Memory Match game itself
├── forgot-password.html  # request a password reset email
├── reset-password.html   # set a new password (landed on via the emailed link)
├── css/style.css
├── js/
│   ├── config.js          # <- your Supabase URL + anon key go here
│   ├── supabaseClient.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── game.js
│   ├── forgot-password.js
│   └── reset-password.js
└── sql/
    ├── schema.sql         # fresh install — run this once in Supabase's SQL editor
    └── migration.sql      # already had the table? run this instead (keeps your data)
```
Troubleshooting
Nothing happens when I click Log in / Sign up: open the browser console (F12) —
almost always it's `js/config.js` still having the placeholder values from Step 4.
"Email not confirmed" error on login: you skipped Step 3, or created the account
before turning confirmation off. Either confirm via the email Supabase sent, or delete
the user in Supabase (Authentication → Users) and sign up again.
History table is empty after finishing a round: open the browser console for an
error from Supabase — it's almost always the RLS policies not applied (redo Step 2).
Password reset email link lands on a generic Supabase page, not your site: you
skipped Step 7 — add your Vercel URL to Supabase's Redirect URLs allow-list.
"This reset link is invalid or has expired" right after clicking a fresh link:
reset links are single-use — if you clicked it twice (e.g. link preview by your email
client) the second attempt will show this. Request a new one.
