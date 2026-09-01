# Infrastructure

This directory contains runtime infrastructure and Gateway reverse proxy configurations for BayesStack.

## Components

- **`docker/next.Dockerfile`**: Multi-stage Docker build for Next.js workspace applications using the `APP_NAME` build argument (`landing`, `learner`, `faculty`, `admin`, `auth`, `super`).
- **`nginx/`**: Production-ready NGINX reverse proxy configuration listening on port `80` (and `443`).
  - **`nginx.conf`**: Global HTTP, event loop, Gzip, log format, and WebSocket HMR proxy mappings.
  - **`conf.d/bayesstack.conf`**: Reverse proxy routing table for root domains (`bayesstack.com`, `localhost`), SuperAdmin (`super.bayesstack.com`, `super.localhost`), and institutional wildcard subdomains (`*.bayesstack.com`, `*.localhost`).

## Routing Architecture

| Domain Pattern | Path Pattern | Targeted Service | Port |
| :--- | :--- | :--- | :--- |
| `bayesstack.com` / `localhost` | `/` | Landing App (`apps/landing`) | `3000` |
| `bayesstack.com` / `localhost` | `/api/*` | FastAPI Monolith (`services/api`) | `8000` |
| `super.bayesstack.com` / `super.localhost` | `/` | SuperAdmin App (`apps/super`) | `3005` / `3000` |
| `super.bayesstack.com` / `super.localhost` | `/api/*` | FastAPI Monolith (`services/api`) | `8000` |
| `*.bayesstack.com` / `*.localhost` | `/api/*` | FastAPI Monolith (`services/api`) | `8000` |
| `*.bayesstack.com` / `*.localhost` | `/login`, `/signup`, `/sso` | Shared Auth App (`apps/auth`) | `3004` / `3000` |
| `*.bayesstack.com` / `*.localhost` | `/learner/*` | Learner App (`apps/learner`) | `3001` / `3000` |
| `*.bayesstack.com` / `*.localhost` | `/faculty/*` | Faculty App (`apps/faculty`) | `3002` / `3000` |
| `*.bayesstack.com` / `*.localhost` | `/admin/*` | Admin App (`apps/admin`) | `3003` / `3000` |

Subdomain tenant slugs (e.g. `bayes`, `ashoka`, `coep`, `vjti`) are automatically extracted and passed downstream via `X-Tenant-Slug` and `X-Forwarded-Host` headers. Reserved platform subdomains (`super`, `www`) are exempted from institutional tenant parsing.

---

## Lightweight Development Profiles (Low CPU/RAM)

To save CPU and RAM during local development, NGINX is configured with dynamic runtime DNS resolution. You do **not** need to run all 9 services at once.

### Docker Compose Selective Startup

```bash
# Minimal Core Stack (API + Shared Auth + Gateway + Postgres) ~ 300MB RAM
docker compose up api auth nginx postgres

# Learner Portal Flow (API + Auth + Learner + Gateway)
docker compose up api auth learner nginx postgres

# SuperAdmin Flow (API + Super + Gateway)
docker compose up api super nginx postgres
```

### CLI Startup Script (`./scripts/start-local.sh`)

```bash
# Run Core Profile (API + Auth)
./scripts/start-local.sh --core

# Run Learner Flow
./scripts/start-local.sh --learner-flow

# Run SuperAdmin Flow (with Live Reloading)
./scripts/start-local.sh --super-flow

# Run Native Local Mode (Fastest HMR, zero-container overhead)
./scripts/start-local.sh --local --super-flow

# Run Custom Service Selection
./scripts/start-local.sh --services api,auth,learner
```

---

## Live Reloading & Hot Module Replacement (HMR)

Live reloading is supported across both Docker and Local Native execution modes:

1. **Docker Mode (`./scripts/start-local.sh --super-flow`)**:
   - Containers run the `target: dev` target stage with Next.js development server (`pnpm dev`) and FastAPI `uvicorn --reload`.
   - Local directory volumes (`./apps`, `./packages`, `./services/api/src`) are mounted into the container.
   - `WATCHPACK_POLLING=true` is enabled so file changes made in your editor immediately trigger Next.js Fast Refresh inside the running container.

2. **Native Local Mode (`./scripts/start-local.sh --local --super-flow`)**:
   - Runs `pnpm dev` directly on host Node.js and virtual environment Python.
   - Sub-100ms instant Fast Refresh hot updates directly on `http://super.localhost`.


