# Deploying the RankVault API (Render)

This is the JSON API (`api.py`) the Next.js frontend talks to. The original
`app.py` (server-rendered Jinja version) is untouched and still works if you
want to run it standalone.

## Why Render, not Vercel
Vercel's Python support is serverless functions with an ephemeral/read-only
filesystem — SQLite writes (logins, saved practice progress, test attempts)
won't reliably persist between requests. Render's free web service runs a
single long-lived container, so the SQLite file at `instance/ascentprep.db`
persists for the life of the service, which is what this app needs.

## Steps
1. Push this folder (`RankVault-flask/RankVault-flask`) to a GitHub repo.
2. On [render.com](https://render.com) → **New +** → **Web Service** → connect
   the repo.
3. Settings:
   - **Root Directory:** `RankVault-flask/RankVault-flask` (if it's a
     subfolder of a bigger repo — otherwise leave blank)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn api:app --bind 0.0.0.0:$PORT`
4. Add an environment variable:
   - `FRONTEND_ORIGIN` = your Vercel URL, e.g.
     `https://rankvault-web.vercel.app` (or `*` while testing, then lock it
     down before submitting)
5. Deploy. Check `https://<your-service>.onrender.com/api/health` returns
   `{"status": "ok"}`.
6. Put that URL into the frontend's `NEXT_PUBLIC_API_URL` env var on Vercel
   and redeploy the frontend.

## Note on Render's free tier
Free instances spin down after ~15 minutes of inactivity and take ~30-50s to
wake on the next request. For a live demo/judging session, hit the
`/api/health` URL a minute before you present to "warm up" the instance —
otherwise the first login on stage might hang for half a minute.

## Local run
```bash
pip install -r requirements.txt
python api.py   # serves http://localhost:5001
```
