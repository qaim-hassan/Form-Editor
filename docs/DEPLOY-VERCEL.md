# Deploy backend + frontend on Vercel (with Neon)

## Overview

| Project | Vercel root directory | Purpose |
|---------|----------------------|---------|
| Backend | `backend` | Express API as serverless (`api/index.ts`) |
| Frontend | `frontend` | Next.js UI |

Database: [Neon](https://neon.tech) (PostgreSQL).

---

## 1. Neon database

1. Create a Neon project.
2. Copy **two** connection strings from the Neon dashboard:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL` on Vercel backend
   - **Direct** (no `-pooler`) → `DIRECT_URL` on Vercel backend (migrations + `prisma migrate deploy` during build)

Both URLs should include `?sslmode=require`.

3. Run migrations once from your machine (replace with your direct URL):

```powershell
cd backend
$env:DATABASE_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require"
npx.cmd prisma migrate deploy
npm.cmd run db:seed
```

---

## 2. Backend Vercel project

1. [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
2. **Root Directory**: `backend`
3. **Framework Preset**: Other
4. **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your frontend URL, e.g. `https://your-frontend.vercel.app` (no trailing slash) |
| `RATE_LIMIT_WINDOW_MS` | `900000` (optional) |
| `RATE_LIMIT_MAX` | `100` (optional) |

5. Deploy. Build runs `prisma generate` + `prisma migrate deploy` via `vercel-build`.

6. Verify: open `https://YOUR-BACKEND.vercel.app/health` — should return JSON `{"status":"ok",...}`.

---

## 3. Frontend Vercel project

1. **Add New Project** → same repo, **Root Directory**: `frontend`
2. **Environment variable**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `https://YOUR-BACKEND.vercel.app` (no trailing slash) |

3. Deploy.

4. Update backend `CORS_ORIGIN` to match the **exact** frontend URL if you used a placeholder, then **redeploy backend**.

---

## 4. Local development after these changes

Add to `backend/.env` (if missing):

```env
DIRECT_URL="postgresql://..."   # same as DATABASE_URL for local Postgres
```

```powershell
cd backend
npm.cmd install
npx.cmd prisma generate
npm.cmd run dev
```

```powershell
cd frontend
npm.cmd run dev
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Backend 500 `FUNCTION_INVOCATION_FAILED` | Check Vercel → Deployment → **Runtime Logs**. Often missing `DATABASE_URL` / `DIRECT_URL` or Prisma binary issue (fixed by `binaryTargets` in schema). |
| Frontend “Cannot reach the API” | Wrong `NEXT_PUBLIC_API_URL`, or backend `/health` not 200. Redeploy frontend after changing env vars. |
| CORS error in browser | Set `CORS_ORIGIN` to frontend origin exactly (scheme + host, no path). |
| “Database unavailable” | Run `prisma migrate deploy` against Neon; confirm pooled `DATABASE_URL` and direct `DIRECT_URL`. |
| Migrations fail on Vercel build | Ensure `DIRECT_URL` is the **non-pooler** Neon host. ||