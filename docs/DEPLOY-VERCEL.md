# Deploy backend + frontend on Vercel (with Neon)

## Important: copying code to another computer

`.env` is **not** in git. Running `npm install` on your laptop only sets up **local** env.

**You must set environment variables in the Vercel dashboard** for the backend project. Copying files and pushing does **not** copy secrets.

### Files that must exist in `backend/` before you push

| File / folder | Required |
|---------------|----------|
| `api/index.ts` | Yes — Vercel serverless entry |
| `vercel.json` | Yes — routes + build |
| `src/app.ts` | Yes — Express app |
| `prisma.config.ts` | Yes — Prisma config |
| `prisma/schema.prisma` | Yes — with `binaryTargets` |
| `package.json` | Yes — includes `vercel-build` script |

After copying, on the other machine:

```powershell
cd backend
npm.cmd install
npx.cmd prisma generate
git add . ; git commit -m "..." ; git push
```

You do **not** need to commit `node_modules` or `.env`.

---

## Overview

| Project | Vercel root directory | Purpose |
|---------|----------------------|---------|
| Backend | `backend` | Express API as serverless (`api/index.ts`) |
| Frontend | `frontend` | Next.js UI |

Database: [Neon](https://neon.tech) (PostgreSQL).

---

## 1. Neon database + migrations (once, from your PC)

Use the **direct** Neon connection string (no `-pooler` in the host):

```powershell
cd backend
# Use your Neon direct URL in .env as DATABASE_URL, or:
$env:DATABASE_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require"
npx.cmd prisma migrate deploy
npm.cmd run db:seed
```

Migrations are **not** run during Vercel build (that was causing deploy failures).

---

## 2. Backend Vercel project

1. [vercel.com](https://vercel.com) → your backend project.
2. **Settings → General → Root Directory** → `backend`
3. **Settings → Environment Variables** — add for **Production** (and Preview if you use preview deploys):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon **pooled** URL (`-pooler` in host) + `?sslmode=require` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Frontend URL, e.g. `https://your-frontend.vercel.app` (no trailing slash) |

Optional: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`

4. Push code → Vercel builds with `npm run vercel-build` → `prisma generate` only.
5. Verify: `https://YOUR-BACKEND.vercel.app/health` → `{"status":"ok",...}`

### If build still fails

Open **Deployments → failed deployment → Building** and scroll **below** the Prisma warnings. Common errors:

| Log message | Fix |
|-------------|-----|
| `Environment variable not found: DATABASE_URL` | Add `DATABASE_URL` in Vercel env vars, redeploy |
| `Can't reach database server` during **build** | Should not happen anymore (migrations removed from build). If it does, check build logs for unexpected DB commands |
| `EPERM` / `query_engine` | Only on Windows locally — stop `npm run dev` before `prisma generate` |
| `Could not find a declaration file for module 'express'` | Fixed: `@types/*` and `typescript` are in `dependencies` (Vercel skips devDependencies in production) |

---

## 3. Frontend Vercel project

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.vercel.app` (no trailing slash) |

Redeploy frontend after changing this variable.

Update backend `CORS_ORIGIN` to match the real frontend URL, then redeploy backend.

---

## 4. Local development

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
| Build shows only Prisma **warnings** then fails | Expand build log — real error is usually after warnings (was often `migrate deploy` — now removed from build) |
| Backend 500 at runtime | **Runtime Logs** — usually missing/wrong `DATABASE_URL` on Vercel |
| Frontend “Cannot reach the API” | Fix backend `/health` first, then set `NEXT_PUBLIC_API_URL` and redeploy frontend |
| CORS error | `CORS_ORIGIN` must exactly match frontend origin |