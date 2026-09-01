# API

This is the only backend process in version one. It is a FastAPI modular monolith, not a collection of microservices.

Functional layout inside `src/`:
- `src/core/` — settings (`config.py`) and async database setup (`database.py`)
- `src/db/` — database models and schema definitions
- `src/auth/` — reserved identity, tenant membership, and RBAC module
- `src/main.py` — FastAPI application entry point

Future functionality belongs in internal functional modules under `src/` (for example, `auth/`, `content/`, or `progress/`). A module should become a separate service only when there is a concrete operational reason to do so.

---

## Dual Setup Support (Docker vs Native PostgreSQL)

The BayesStack API supports two developer workflows out of the box:

### Level 1: Docker Setup (Linux / Docker Desktop)
When using Docker, container services for PostgreSQL, PgAdmin, FastAPI, and Next.js applications are fully orchestrated via `compose.yaml`:
```bash
docker compose up --build
```
* **PostgreSQL**: Port `5432` (`bayesstack` DB)
* **PgAdmin Viewer**: `http://localhost:5050` (Email: `admin@bayesstack.local`, Password: `admin`)
* **API**: `http://localhost:8000/health` (Automatically configured to connect to `postgres:5432`)

---

### Level 2: Local / Native Setup (Windows / Machine without Docker, with local PostgreSQL installed)
If you have PostgreSQL installed natively on Windows or Linux (e.g. running via `psql` / Windows Service):

1. **Configure Environment Credentials**:
   Copy `.env.example` to `.env` (or `services/api/.env`):
   ```ini
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_local_password
   POSTGRES_DB=bayesstack
   ```
2. **Start the API natively**:
   On Windows (PowerShell):
   ```powershell
   .\scripts\start-local.ps1 -Local -Api
   ```
   On Linux/macOS (Bash):
   ```bash
   ./scripts/start-local.sh --local api
   ```
   *Note: On API startup, if the database `bayesstack` does not exist on your local PostgreSQL server, the API automatically attempts to create it for you!*

---

## Database Migrations & Cross-Machine Seed Synchronization

BayesStack uses **Alembic** for schema migrations and version-controlled idempotent seed definitions in `src/db/seed.py`.

### Running Migrations Across Developer Machines
When pulling new changes from `git`:

1. **Apply Latest Migrations**:
   ```bash
   cd services/api
   .venv/bin/alembic upgrade head
   ```

2. **Sync Seed Data (Includes Bayes Institute)**:
   ```bash
   cd services/api
   PYTHONPATH=src .venv/bin/python src/db/seed.py
   ```
   *Note: Application startup automatically runs table initialization & seeding if missing, keeping developer environments in sync.*

### Default Seed Tenants Included

| Tenant Name | Slug | Subdomain / Base URL |
| :--- | :--- | :--- |
| **Bayes Institute** | `bayes` | `bayes.bayesstack.com` / `bayes.localhost` |
| **Ashoka University** | `ashoka` | `ashoka.bayesstack.com` / `ashoka.localhost` |
| **COEP Technological University** | `coep` | `coep.bayesstack.com` / `coep.localhost` |
| **VJTI Mumbai** | `vjti` | `vjti.bayesstack.com` / `vjti.localhost` |

---

## Endpoint Verification
- `GET /health` — Returns status of API service, environment mode, and live PostgreSQL connection check.
- `GET /api/tenant-config` — Resolves active tenant context based on `Host` header (`bayes.localhost`, `ashoka.localhost`).

