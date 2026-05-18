# Dynamic Form Builder

Production-quality MVP for creating versioned form templates, collecting submissions, and viewing responses.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Express 5, TypeScript, Prisma |
| Database | PostgreSQL |
| Validation | Zod (client + server) |
| Forms | React Hook Form |
| State | Zustand (builder) |
| DnD | @dnd-kit |

## Features

- Create, edit, delete form templates
- Drag-and-drop field ordering with live preview
- Field types: text, textarea, number, email, date, select, checkbox
- Fill forms with client-side validation
- View submissions per template family
- **Versioned templates**: editing after submissions creates a new version; old submissions stay on their version; new submissions use the latest version

## Project structure

```
├── backend/          # Express REST API
├── frontend/         # Next.js App Router UI
├── docs/API.md       # REST API reference
└── docker-compose.yml
```

## Quick start (local)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

### 1. Database

**Option A — Docker**

```bash
docker compose up db -d
```

**Option B — existing Postgres**

Create a database and set `DATABASE_URL` in `backend/.env`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

API runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### Full stack with Docker

```bash
docker compose up --build
```

Then seed manually:

```bash
cd backend && npm run db:seed
```

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX` | Max requests per window |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL |

## Scripts

### Backend

- `npm run dev` — start API with hot reload
- `npm run build` / `npm start` — production build
- `npm run db:migrate` — run migrations (dev)
- `npm run db:seed` — seed sample data
- `npm test` — API tests (Vitest + Supertest)

### Frontend

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start` — production
- `npm test` — component tests

## Deployment

### Frontend — Vercel

1. Import the `frontend` directory as a Vercel project.
2. Set `NEXT_PUBLIC_API_URL` to your deployed API URL.
3. Deploy.

### Backend — Render / Railway / Fly.io

1. Deploy `backend` with Node 20+.
2. Set `DATABASE_URL`, `CORS_ORIGIN` (your Vercel URL), `NODE_ENV=production`.
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npx prisma migrate deploy && npm start`

### PostgreSQL — Supabase / Neon / Railway

Create a project and paste the connection string into `DATABASE_URL`.

**Example Render env**

```
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

## Architecture decisions

### Versioned templates

When a template family has any submission, `PUT /api/forms/:id` creates a new row with incremented `version` and `parentTemplateId` pointing at the root template. In-place updates occur only when no submissions exist. This preserves submission integrity without a separate schema-version table.

### Latest-version submissions

`POST /api/forms/:id/submissions` resolves the latest version in the family so fill links keep working across versions.

### Submission listing

`GET /api/forms/:id/submissions` returns submissions across all versions in the family for a unified viewer.

### Tradeoffs

| Choice | Benefit | Cost |
|--------|---------|------|
| Version rows vs snapshot JSON | Queryable, normalized | More rows on edit |
| Zustand for builder only | Simple, no boilerplate | No global app state |
| String storage for values | Flexible for all field types | No native typed columns |
| Sanitize HTML on text | XSS mitigation | Strips all markup |

### Future improvements

- Authentication and per-user form ownership
- Public share links / embed codes
- Conditional field logic
- File upload fields
- Export submissions (CSV)
- Webhooks on submit
- Admin analytics dashboard
- E2E tests with Playwright

## API documentation

See [docs/API.md](docs/API.md).

## License

MIT
