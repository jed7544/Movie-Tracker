# 🎬 Movie Price Tracker

Tracks movies on the Apple/iTunes Store and sends you an SMS when they go on sale. Checks prices automatically every Sunday at 9am.

---

## Deploy in 5 steps

### Step 1 — Get the code on GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click the **+** icon → **New repository** → name it `movie-tracker` → click **Create**
3. Upload all these files by dragging them into the GitHub file area, or use the instructions on screen

### Step 2 — Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Select your `movie-tracker` repository → click **Deploy**
4. Vercel will build and deploy your app automatically — takes about 1 minute
5. You'll get a URL like `https://movie-tracker-abc123.vercel.app` — that's your app!

### Step 3 — Add a database (Vercel KV)

1. In your Vercel project dashboard, click **Storage** in the top nav
2. Click **Create → KV**
3. Name it `movie-tracker-kv` → click **Create**
4. Click **Connect to Project** → select your project
5. Vercel automatically adds the `KV_*` environment variables — nothing to copy

### Step 4 — Add two environment variables

In Vercel → your project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `CRON_SECRET` | Any long random string — make one up (e.g. `mysecret123abc`) |
| `PRICE_THRESHOLD` | Price in USD to alert at (e.g. `5.99`) |

After adding, go to **Deployments** → click the three dots on your latest deploy → **Redeploy**.

### Step 5 — You're live!

- Visit your Vercel URL to start adding movies
- Every Sunday at 9am UTC, prices are checked automatically
- If any movie is on sale below your threshold, you'll get a text message
- You can also trigger a manual check from the app (you'll need your `CRON_SECRET`)

---

## How it works

```
Your app (Next.js) → Vercel Cron (every Sunday)
                          ↓
                   iTunes API (price check)
                          ↓
                  Vercel KV (save new prices)
                          ↓
               Twilio SMS → your phone
```

## Changing the schedule

Edit `vercel.json`. The schedule uses cron syntax:
- `0 9 * * 0` = every Sunday at 9am UTC
- `0 9 * * 1` = every Monday at 9am UTC
- `0 17 * * 0` = every Sunday at 5pm UTC

## Local development

```bash
npm install
cp .env.local.example .env.local
# fill in your .env.local values
npm run dev
# open http://localhost:3000
```
