# RankVault — Frontend (Next.js + Tailwind + Framer Motion)

Frontend for RankVault, a JEE/NEET chapter-practice and mock-test platform.
Built for **Frontend Battle 2026**. Talks to the Flask JSON API in
`../RankVault-flask/RankVault-flask/api.py` over a bearer token.

## Design system
- **Palette:** deep exam-hall navy (`--ink`) + OMR-sheet paper cream (`--paper`)
  + rank-card gold (`--gold`) — not the generic cream/terracotta or
  near-black/neon AI defaults.
- **Type:** Fraunces (display) + Inter (body) + IBM Plex Mono (scores, roll
  numbers, timers).
- **Signature element:** `OmrRow` — a 10-bubble answer-sheet row standing in
  for every progress bar in the app, since the product is literally about
  exam scoring.

## Local dev
```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

## Deploy to Vercel
1. Push this folder to a GitHub repo (or the monorepo root — set the
   Vercel "Root Directory" to `rankvault-web` if so).
2. Import the repo in Vercel → framework auto-detected as Next.js.
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = your deployed
   Flask API URL (e.g. `https://rankvault-api.onrender.com`).
4. Deploy. No build command changes needed.

## Backend
See `../RankVault-flask/RankVault-flask/DEPLOY.md` for deploying the Flask
API (Render recommended — free tier, persists SQLite between requests
unlike Vercel serverless functions).
