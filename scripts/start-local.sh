#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="auto"

for argument in "$@"; do
  case "$argument" in
    --docker) MODE="docker" ;;
    --local) MODE="local" ;;
    -h|--help)
      echo "Usage: ./scripts/start-local.sh [--docker|--local]"
      exit 0
      ;;
    *) echo "Unknown option: $argument" >&2; exit 1 ;;
  esac
done

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

if [[ "$MODE" == "docker" ]] || [[ "$MODE" == "auto" && docker_ready ]]; then
  if ! docker_ready; then
    echo "Docker and Docker Compose must be installed and running." >&2
    exit 1
  fi
  exec docker compose -f "$ROOT_DIR/compose.yaml" up --build
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required for local mode." >&2
  exit 1
fi

run_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  elif command -v npx >/dev/null 2>&1; then
    npx --yes pnpm@11.23.0 "$@"
  else
    echo "pnpm, Corepack, or npx is required for local mode." >&2
    exit 1
  fi
}

cd "$ROOT_DIR"
run_pnpm install

PYTHON_COMMAND=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_COMMAND="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_COMMAND="python"
fi
if [[ -z "$PYTHON_COMMAND" ]]; then
  echo "Python 3 is required for the API." >&2
  exit 1
fi

VENV_DIR="$ROOT_DIR/services/api/.venv"
if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  "$PYTHON_COMMAND" -m venv "$VENV_DIR"
fi
"$VENV_DIR/bin/python" -m pip install -e "$ROOT_DIR/services/api" >/dev/null

PIDS=()
cleanup() { kill "${PIDS[@]}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

(
  cd "$ROOT_DIR/services/api"
  exec "$VENV_DIR/bin/python" -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
) & PIDS+=("$!")

start_app() {
  local name="$1"
  local port="$2"
  (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/$name" dev --hostname 0.0.0.0 --port "$port") & PIDS+=("$!")
}

start_app landing 3000
start_app learner 3001
start_app faculty 3002
start_app admin 3003

echo "BayesStack is running in local mode. Press Ctrl+C to stop."
echo "Landing: http://localhost:3000"
echo "Learner: http://localhost:3001"
echo "Faculty: http://localhost:3002"
echo "Admin:   http://localhost:3003"
echo "API:     http://localhost:8000/health"

wait
