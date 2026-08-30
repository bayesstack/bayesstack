# BayesStack

BayesStack is a pnpm and Turborepo monorepo.

It is the beginning of a multi-tenant learning platform for higher education. The long-term product includes a learner experience, faculty authoring, institutional administration, reusable learning content, and interactive learning studios. This repository is intentionally an early skeleton: most folders are boundaries, not implemented features.

## What is here

- Four minimal Next.js application shells in `apps/`.
- One FastAPI server in `services/api/`.
- Video and Coding studio boundaries in `studios/`.
- A reserved shared UI boundary in `packages/ui/`.
- pnpm workspaces and Turborepo for JavaScript/TypeScript dependency and task management.
- Docker Compose and native local startup scripts.

There is no database, authentication implementation, studio runtime, or microservice network yet. The API is deliberately a single process.

## Applications

- `apps/landing` — landing page and lead capture
- `apps/learner` — main student application
- `apps/faculty` — course builder and authoring frontend
- `apps/admin` — institutional administration frontend

## Setup Paths: Docker vs Native PostgreSQL

Choose the setup path appropriate for your machine:

1. **Level 1 — Docker Mode (Linux / Docker Desktop)**:
   Containers for PostgreSQL, PgAdmin, FastAPI, and Next.js are managed via Docker Compose (`compose.yaml`). PostgreSQL runs on port `5432` and PgAdmin web viewer runs at `http://localhost:5050`.

2. **Level 2 — Native Local Mode (Windows / Machine without Docker)**:
   If you have Node.js 22+, Python 3.12+, and PostgreSQL installed natively (e.g. running via Windows service or `psql`), copy `.env.example` to `services/api/.env` and set your local PostgreSQL credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST=localhost`). The API will connect directly to your local PostgreSQL server and auto-create the `bayesstack` database if missing.

The scripts below provide standard entry points for both setup paths.

## Start services

The start script prompts interactively for which service you want to start (`landing`, `learner`, `faculty`, `admin`, `ui`, `api`, or `all`). Running a single service saves CPU and memory.

```bash
# Interactive menu (asks which service to start)
./scripts/start-local.sh

# Start a specific service
./scripts/start-local.sh landing

# Start all services simultaneously
./scripts/start-local.sh --all
```

On Windows PowerShell:

```powershell
.\scripts\start-local.ps1
.\scripts\start-local.ps1 -Landing
.\scripts\start-local.ps1 -All
```

On Windows Command Prompt:

```bat
scripts\start-local.cmd
```

To choose mode explicitly:

```bash
./scripts/start-local.sh --docker landing
./scripts/start-local.sh --local landing
```

```powershell
.\scripts\start-local.ps1 -Docker -Service landing
.\scripts\start-local.ps1 -Local -Service landing
```


The first native startup creates `services/api/.venv` and installs the API's small Python dependency set. It also installs JavaScript dependencies with pnpm. These generated directories are ignored by Git.

## Local URLs

| Surface | URL |
| --- | --- |
| Landing | <http://localhost:3000> |
| Learner | <http://localhost:3001> |
| Faculty | <http://localhost:3002> |
| Admin | <http://localhost:3003> |
| Design Studio / Storybook | <http://localhost:6001> |
| API health | <http://localhost:8000/health> |
| PgAdmin Viewer | <http://localhost:5050> |

## Docker commands

The root [`compose.yaml`](compose.yaml) starts PostgreSQL, PgAdmin, the FastAPI service, and each Next.js app. The four apps share [`infra/docker/next.Dockerfile`](infra/docker/next.Dockerfile); the API has [`services/api/Dockerfile`](services/api/Dockerfile).

```bash
docker compose up --build
docker compose down
docker compose logs -f api postgres pgadmin
```

PostgreSQL runs on port `5432` (`bayesstack` DB) and PgAdmin web viewer runs at `http://localhost:5050` (login: `admin@bayesstack.local` / `admin`).

## Development commands

Run all JavaScript applications through Turborepo:

```bash
corepack pnpm install
pnpm dev
pnpm build
pnpm typecheck
```

Run one app:

```bash
pnpm --filter @bayesstack/learner dev
```

Run only the shared UI catalog:

```bash
corepack pnpm --filter @bayesstack/ui dev
```

Run only the API natively:

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\Activate.ps1
pip install -e .
uvicorn main:app --app-dir src --reload --port 8000
```

## Repository map

```text
apps/                 Next.js application shells
services/api/         Single FastAPI modular monolith
studios/              Video and Coding future learning environments
packages/ui/          Reserved shared UI library boundary
scripts/              Cross-platform startup entry points
infra/docker/         Shared Docker build configuration
compose.yaml          Local multi-container runtime
```

Read the README inside [`studios/`](studios/README.md), [`services/`](services/README.md), and [`scripts/`](scripts/README.md) for the boundary-specific notes.
