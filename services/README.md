# Services

Version one uses a modular monolith: one Python package and one FastAPI server. Functionality is split into internal modules so the boundaries stay clear without introducing service-to-service communication.

## Current services

- `api` — the single FastAPI server
  - `api/auth` — reserved identity, tenant membership, and RBAC module

Auth is currently only a module boundary. It will be implemented inside the API before any extraction is considered.

## Local development

In separate terminals:

```bash
cd services/api
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn api.main:app --reload --port 8000
```
