# RankVault — Flask backend

A real backend for the platform: SQLite-backed student accounts, server-side
login sessions, and pages that are computed per logged-in student instead of
hard-coded.

## Run it

```bash
pip install -r requirements.txt
python app.py
```

Then open **http://localhost:5000** — it redirects straight to the login page.

A SQLite database is created automatically on first run at
`instance/rankvault.db`, seeded with 20 student accounts.

## Logging in as different profiles

Every seeded account uses enrollment ID + password, same as a real login:

- **Enrollment ID:** e.g. `AP24-1182`
- **Password (all 20 demo accounts):** `ascent123`

The login page also lists all 20 profiles with a search box — click any card
to auto-fill its enrollment ID, then the password is filled in for you too
(demo convenience only; remove that in a real deployment).

Once logged in, a signed session cookie (`Flask` `session`) keeps you logged
in across pages and browser refreshes. `Log out` in the sidebar clears it.
Every page route is wrapped in `@login_required`, which redirects to
`/login` if there's no valid session — try opening `/dashboard` in a private
window to see it bounce you to the login page.

## What's actually personalized per student

- **Dashboard & myPlan** — syllabus %, accuracy, and the "needs attention"
  list are computed per student from `content.get_student_stats()`. It's a
  deterministic function (same seed → same numbers every time) rather than
  20 hand-authored datasets — swap it for a real progress-tracking table
  whenever you wire up actual CPP/test attempts at scale.
- **Test Engine** — submitting a test POSTs to `/api/submit-test`, which
  grades server-side (the client never receives the answer key — check
  `app.py`'s `test_engine()` route, which strips it before rendering) and
  writes a row to `test_attempts`. That row is what the dashboard's
  "Last test score" card reads back.
- **Lectures** — watch position is POSTed to `/api/lecture-progress` every
  few seconds and on pause/unload, stored in `lecture_progress`, and read
  back on your next visit — so "resume where you left off" survives an
  actual logout/login, not just a page refresh.

## Project layout

```
app.py              Flask routes, auth/session, the two write APIs
db.py                SQLite schema + queries (students, test_attempts, lecture_progress)
content.py           Shared curriculum data (subjects, CPP bank, lectures, test questions)
templates/           Jinja2 pages — base.html is the shared sidebar shell
static/               CSS + the per-page JS that drives the interactive bits
  (test-engine.js, packages.js, lectures.js, myplan.js, app.js)
instance/             SQLite file lives here once created (gitignored)
```

## Known simplifications (this is a prototype)

- The Class 9–12 selector on Study Packages is visual only — all classes
  currently render the same Class 12 PCM content. Wiring it up for real means
  keying `SUBJECTS`/`CPP_BANK` by grade too.
- `get_student_stats()` is a stand-in for real progress data. It's enough to
  prove "every login sees different numbers," but a production version
  should compute these from actual `test_attempts` / CPP-attempt rows.
- `SECRET_KEY` defaults to a dev value — set the `SECRET_KEY` environment
  variable before deploying this anywhere real.
- No password reset / signup flow — accounts are seeded once at startup.
