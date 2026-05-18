# Quick setup (Windows)

## Fix "Internal server error" when saving forms

Your API is running, but **PostgreSQL is not**. The backend log shows:

`Can't reach database server at localhost:5432`

You must start a database before forms can be saved.

### Fastest fix: Neon (free cloud DB, ~3 minutes)

1. Go to **https://neon.tech** → Sign up (free).
2. Create a project → copy the **connection string** (starts with `postgresql://`).
3. Open `backend\.env` and replace `DATABASE_URL`:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
   ```

4. In PowerShell (**stop the API with Ctrl+C first**):

   ```powershell
   cd C:\Users\Public\Test\backend
   npx.cmd prisma migrate deploy
   npm.cmd run db:seed
   npm.cmd run dev
   ```

5. Refresh http://localhost:3000 and try saving a form again.

### Alternative: local PostgreSQL

Install from https://www.postgresql.org/download/windows/  
Create a database named `formbuilder`, then update `DATABASE_URL` in `backend\.env` if your password is not `postgres`.

---

## Why "Network Error"?

The frontend calls `http://localhost:4000`. You see **Network Error** when:

1. **Backend is not running** — most common.
2. **Prisma client missing** — run `npx prisma generate` in `backend/`.
3. **PostgreSQL is not running** — API may start but list/create forms will fail.

## Step-by-step

### 1. Backend — generate Prisma client

**Stop the API first** if it is running (`Ctrl+C` in the backend terminal). Otherwise Windows may show:

`EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

```powershell
cd C:\Users\Public\Test\backend
npx.cmd prisma generate
```

If EPERM persists, kill the process on port 4000 and retry:

```powershell
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npx.cmd prisma generate
```

### 2. PostgreSQL (pick one)

**Option A — Neon (free, no local install)**

1. Create a project at https://neon.tech
2. Copy the connection string
3. Paste into `backend\.env` as `DATABASE_URL=...`

**Option B — Local PostgreSQL**

1. Install from https://www.postgresql.org/download/windows/
2. Create database: `formbuilder`
3. Update `backend\.env` if your password is not `postgres`

**Option C — Docker**

```powershell
docker compose up db -d
```

### 3. Run migrations & seed

```powershell
cd C:\Users\Public\Test\backend
npx.cmd prisma migrate deploy
npm.cmd run db:seed
```

### 4. Start API (terminal 1)

```powershell
cd C:\Users\Public\Test\backend
npm.cmd run dev
```

You should see: `API listening on http://localhost:4000`

Test: open http://localhost:4000/health in a browser.

### 5. Start frontend (terminal 2)

```powershell
cd C:\Users\Public\Test\frontend
npm.cmd run dev
```

Open http://localhost:3000
