# API

This is the only backend process in version one. It is a FastAPI modular monolith, not a collection of microservices.

Future functionality belongs in internal modules under `src/api/` (for example, `auth/`, `content/`, or `progress/`). A module should become a separate service only when there is a concrete operational reason to do so.

## Run natively

From the repository root:

```bash
python -m venv services/api/.venv
source services/api/.venv/bin/activate       # Windows: services\\api\\.venv\\Scripts\\Activate.ps1
pip install -e services/api
uvicorn api.main:app --app-dir services/api/src --reload --port 8000
```

The current endpoint is `GET /health`.
