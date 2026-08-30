#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/lib/node_modules/corepack/shims:$PATH"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="auto"
SERVICE=""
ACTION="start"
TARGET_STOP=""

show_help() {
  echo "Usage: ./scripts/start-local.sh [options] [service]"
  echo ""
  echo "Options:"
  echo "  --docker                   Force Docker mode"
  echo "  --local                    Force Local (native) mode"
  echo "  --stop, --kill, -k [name] Gracefully shut down process running on service port(s)"
  echo "  -h, --help                 Show this help message"
  echo ""
  echo "Services:"
  echo "  landing                    Start Landing app (http://localhost:3000)"
  echo "  learner                    Start Learner app (http://localhost:3001)"
  echo "  faculty                    Start Faculty app (http://localhost:3002)"
  echo "  admin                      Start Admin app (http://localhost:3003)"
  echo "  ui                         Start UI Storybook catalog (http://localhost:6001)"
  echo "  api                        Start FastAPI backend (http://localhost:8000)"
  echo "  all                        Start all services simultaneously"
  echo ""
  echo "Service Flags:"
  echo "  --landing, --learner, --faculty, --admin, --ui, --api, --all, -a"
  echo "  --service <name>"
  echo ""
  echo "Stop / Free Port Examples:"
  echo "  ./scripts/start-local.sh --stop ui       # Gracefully shut down process on port 6001"
  echo "  ./scripts/start-local.sh --stop all      # Gracefully shut down processes on all service ports"
  echo "  ./scripts/start-local.sh --stop 6001     # Gracefully shut down process on port 6001"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker) MODE="docker"; shift ;;
    --local) MODE="local"; shift ;;
    --stop|--kill|--free-port|-k)
      ACTION="stop"
      if [[ -n "${2:-}" ]] && [[ "$2" != -* ]]; then
        TARGET_STOP="$2"
        shift 2
      else
        shift
      fi
      ;;
    stop|kill)
      ACTION="stop"
      if [[ -n "${2:-}" ]] && [[ "$2" != -* ]]; then
        TARGET_STOP="$2"
        shift 2
      else
        shift
      fi
      ;;
    --all|-a) SERVICE="all"; shift ;;
    --landing) SERVICE="landing"; shift ;;
    --learner) SERVICE="learner"; shift ;;
    --faculty) SERVICE="faculty"; shift ;;
    --admin) SERVICE="admin"; shift ;;
    --ui) SERVICE="ui"; shift ;;
    --api) SERVICE="api"; shift ;;
    --service)
      if [[ -n "${2:-}" ]]; then
        SERVICE="$2"
        shift 2
      else
        echo "Error: --service requires a service name" >&2
        exit 1
      fi
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    landing|learner|faculty|admin|ui|api|all)
      SERVICE="$1"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      show_help >&2
      exit 1
      ;;
  esac
done

free_port() {
  local port="$1"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti:"$port" 2>/dev/null | tr '\n' ' ' | xargs || true)
  elif command -v fuser >/dev/null 2>&1; then
    pids=$(fuser "$port/tcp" 2>/dev/null | tr '\n' ' ' | xargs || true)
  elif command -v ss >/dev/null 2>&1; then
    pids=$(ss -lptn "sport = :$port" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | tr '\n' ' ' | xargs || true)
  fi

  if [[ -n "$pids" ]]; then
    echo "Port $port is in use by PID(s): $pids. Gracefully shutting down..."
    kill -15 $pids 2>/dev/null || true

    local count=0
    while [[ $count -lt 20 ]]; do
      local alive=0
      for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
          alive=1
          break
        fi
      done
      if [[ $alive -eq 0 ]]; then
        break
      fi
      sleep 0.1
      count=$((count + 1))
    done

    for pid in $pids; do
      if kill -0 "$pid" 2>/dev/null; then
        echo "PID $pid on port $port did not exit gracefully; force killing (SIGKILL)..."
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
    echo "Port $port gracefully freed."
  fi
}

free_service_ports() {
  local target="${1:-$SERVICE}"
  case "$target" in
    landing) free_port 3000 ;;
    learner) free_port 3001 ;;
    faculty) free_port 3002 ;;
    admin)   free_port 3003 ;;
    ui)      free_port 6001 ;;
    api)     free_port 8000 ;;
    all)
      free_port 3000
      free_port 3001
      free_port 3002
      free_port 3003
      free_port 6001
      free_port 8000
      ;;
    [0-9]*)
      free_port "$target"
      ;;
    *)
      echo "Unknown service or port: $target" >&2
      return 1
      ;;
  esac
}

if [[ "$ACTION" == "stop" ]]; then
  TARGET="${TARGET_STOP:-$SERVICE}"
  if [[ -z "$TARGET" ]]; then
    if [[ -t 0 ]]; then
      read -r -p "Enter service or port to stop [landing|learner|faculty|admin|ui|api|all|port] (default: all): " TARGET
      TARGET="${TARGET:-all}"
    else
      TARGET="all"
    fi
  fi
  echo "Stopping running process(es) for '$TARGET'..."
  free_service_ports "$TARGET"
  exit 0
fi

if [[ -z "$SERVICE" ]]; then
  if [[ -t 0 ]]; then
    echo "=========================================="
    echo "       BayesStack Service Selector        "
    echo "=========================================="
    echo "Which service would you like to start?"
    echo "  1) landing   (App - http://localhost:3000)"
    echo "  2) learner   (App - http://localhost:3001)"
    echo "  3) faculty   (App - http://localhost:3002)"
    echo "  4) admin     (App - http://localhost:3003)"
    echo "  5) ui        (Storybook - http://localhost:6001)"
    echo "  6) api       (FastAPI - http://localhost:8000)"
    echo "  7) all       (Start all services - High CPU/RAM)"
    echo "  8) stop      (Gracefully shut down running port(s))"
    echo "=========================================="
    read -r -p "Enter choice [1-8] (default: 1): " choice
    case "$choice" in
      1|landing) SERVICE="landing" ;;
      2|learner) SERVICE="learner" ;;
      3|faculty) SERVICE="faculty" ;;
      4|admin)   SERVICE="admin" ;;
      5|ui)      SERVICE="ui" ;;
      6|api)     SERVICE="api" ;;
      7|all)     SERVICE="all" ;;
      8|stop)
        read -r -p "Enter service or port to stop [landing|learner|faculty|admin|ui|api|all|port] (default: all): " TARGET_STOP
        TARGET_STOP="${TARGET_STOP:-all}"
        echo "Stopping running process(es) for '$TARGET_STOP'..."
        free_service_ports "$TARGET_STOP"
        exit 0
        ;;
      "")        SERVICE="landing" ;;
      *)
        echo "Invalid selection: $choice" >&2
        exit 1
        ;;
    esac
  else
    echo "No service specified and running in non-interactive mode." >&2
    echo "Usage: $0 [landing|learner|faculty|admin|ui|api|all] or $0 --stop" >&2
    exit 1
  fi
fi

# Signal trap for graceful cleanup on Ctrl+C (INT) or SIGTERM
PIDS=()
cleanup_on_exit() {
  trap - INT TERM EXIT
  echo ""
  echo "Received interrupt signal. Gracefully shutting down '$SERVICE'..."
  if [[ -n "${PIDS:-}" && ${#PIDS[@]} -gt 0 ]]; then
    kill "${PIDS[@]}" 2>/dev/null || true
  fi
  if [[ -n "$SERVICE" ]]; then
    free_service_ports "$SERVICE"
  fi
  echo "BayesStack service(s) shut down gracefully."
  exit 0
}
trap cleanup_on_exit INT TERM

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

if [[ "$MODE" == "docker" ]] || [[ "$MODE" == "auto" && docker_ready ]]; then
  if ! docker_ready; then
    echo "Docker and Docker Compose must be installed and running." >&2
    exit 1
  fi
  if [[ "$SERVICE" == "all" ]]; then
    echo "Starting all services in Docker mode..."
    exec docker compose -f "$ROOT_DIR/compose.yaml" up --build
  elif [[ "$SERVICE" == "ui" ]]; then
    echo "UI (Storybook) is not configured in Docker Compose. Running UI locally..."
    MODE="local"
  else
    echo "Starting $SERVICE in Docker mode..."
    exec docker compose -f "$ROOT_DIR/compose.yaml" up --build "$SERVICE"
  fi
fi

if [[ "$MODE" != "docker" ]]; then
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

  setup_python_api() {
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
      echo "Setting up Python virtual environment..."
      "$PYTHON_COMMAND" -m venv "$VENV_DIR"
    fi
    "$VENV_DIR/bin/python" -m pip install -e "$ROOT_DIR/services/api" >/dev/null
  }

  cd "$ROOT_DIR"

  case "$SERVICE" in
    landing)
      free_service_ports "landing"
      run_pnpm install
      echo "Starting Landing app at http://localhost:3000..."
      run_pnpm --filter "@bayesstack/landing" dev --hostname 0.0.0.0 --port 3000 &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    learner)
      free_service_ports "learner"
      run_pnpm install
      echo "Starting Learner app at http://localhost:3001..."
      run_pnpm --filter "@bayesstack/learner" dev --hostname 0.0.0.0 --port 3001 &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    faculty)
      free_service_ports "faculty"
      run_pnpm install
      echo "Starting Faculty app at http://localhost:3002..."
      run_pnpm --filter "@bayesstack/faculty" dev --hostname 0.0.0.0 --port 3002 &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    admin)
      free_service_ports "admin"
      run_pnpm install
      echo "Starting Admin app at http://localhost:3003..."
      run_pnpm --filter "@bayesstack/admin" dev --hostname 0.0.0.0 --port 3003 &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    ui)
      free_service_ports "ui"
      run_pnpm install
      echo "Starting UI catalog (Storybook) at http://localhost:6001..."
      run_pnpm --filter "@bayesstack/ui" dev &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    api)
      free_service_ports "api"
      setup_python_api
      echo "Starting API backend at http://localhost:8000/health..."
      cd "$ROOT_DIR/services/api"
      "$ROOT_DIR/services/api/.venv/bin/python" -m uvicorn main:app --app-dir src --reload --host 0.0.0.0 --port 8000 &
      PIDS+=("$!")
      wait "$!" 2>/dev/null || cleanup_on_exit
      ;;
    all)
      free_service_ports "all"
      run_pnpm install
      setup_python_api

      (
        cd "$ROOT_DIR/services/api"
        exec "$ROOT_DIR/services/api/.venv/bin/python" -m uvicorn main:app --app-dir src --reload --host 0.0.0.0 --port 8000
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

      (
        cd "$ROOT_DIR"
        run_pnpm --filter "@bayesstack/ui" dev
      ) & PIDS+=("$!")

      echo "BayesStack is running all services in local mode. Press Ctrl+C to stop."
      echo "Landing: http://localhost:3000"
      echo "Learner: http://localhost:3001"
      echo "Faculty: http://localhost:3002"
      echo "Admin:   http://localhost:3003"
      echo "UI:      http://localhost:6001"
      echo "API:     http://localhost:8000/health"

      wait
      ;;
    *)
      echo "Unknown service: $SERVICE" >&2
      exit 1
      ;;
  esac
fi
