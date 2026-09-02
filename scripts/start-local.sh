#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/lib/node_modules/corepack/shims:$PATH"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="auto"
ACTION="start"
TARGET_STOP=""
RAW_SERVICE_ARGS=()

show_help() {
  echo "Usage: ./scripts/start-local.sh [options] [core|profile|service1 service2 ...]"
  echo ""
  echo "Options:"
  echo "  --docker                   Force Docker mode (run services in containerized format)"
  echo "  --local                    Force Local (native) mode (run services directly in shell)"
  echo "  --stop, --kill, -k [name] Gracefully shut down process running on service port(s)"
  echo "  -h, --help                 Show this help message"
  echo ""
  echo "1. Core Services Profile (EC2 / Production Ready):"
  echo "  core                       Starts all core services needed to run BayesStack end-to-end:"
  echo "                             (postgres, api, auth, super, learner, faculty, admin, landing, nginx)"
  echo "                             Note: Omits dev-only bloat (pgadmin visualizer, storybook UI)."
  echo ""
  echo "2. Selective Dockerized/Local Service Execution:"
  echo "  Pass specific service names to run only those services:"
  echo "  - landing                  Landing website (http://localhost:3000)"
  echo "  - learner                  Learner Portal (http://localhost:3001)"
  echo "  - faculty                  Faculty Portal (http://localhost:3002)"
  echo "  - admin                    Admin Portal (http://localhost:3003)"
  echo "  - auth                     Auth Gateway (http://localhost:3004)"
  echo "  - super                    SuperAdmin Studio (http://localhost:3005)"
  echo "  - api                      FastAPI Backend (http://localhost:8000)"
  echo "  - postgres                 PostgreSQL Database (port 5432)"
  echo "  - nginx                    Reverse Proxy Router (port 80)"
  echo "  - ui                       Storybook Component Catalog (port 6001)"
  echo "  - pgadmin                  PgAdmin Database Visualizer (port 5050)"
  echo ""
  echo "Execution Examples:"
  echo "  # Case 1: Run all core services end-to-end in Docker"
  echo "  ./scripts/start-local.sh --docker core"
  echo ""
  echo "  # Case 2: Run specific custom services in Docker"
  echo "  ./scripts/start-local.sh --docker api super nginx"
  echo "  ./scripts/start-local.sh --docker landing nginx"
  echo "  ./scripts/start-local.sh --docker api,super,nginx"
  echo ""
  echo "  # Local native mode examples"
  echo "  ./scripts/start-local.sh core"
  echo "  ./scripts/start-local.sh api super"
  echo "  ./scripts/start-local.sh --stop core"
}

expand_profile() {
  local target="$1"
  case "$target" in
    core|minimal) echo "postgres api auth super learner faculty admin landing nginx" ;;
    learner-flow) echo "postgres api auth learner nginx" ;;
    faculty-flow) echo "postgres api auth faculty nginx" ;;
    admin-flow)   echo "postgres api auth admin nginx" ;;
    super-flow)   echo "postgres api super nginx" ;;
    all)          echo "postgres api landing learner faculty admin auth super ui pgadmin nginx" ;;
    *)            echo "$target" ;;
  esac
}

# Parse command line flags & arguments
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
    --all|-a) RAW_SERVICE_ARGS+=("all"); shift ;;
    --core|--minimal) RAW_SERVICE_ARGS+=("core"); shift ;;
    --learner-flow) RAW_SERVICE_ARGS+=("learner-flow"); shift ;;
    --faculty-flow) RAW_SERVICE_ARGS+=("faculty-flow"); shift ;;
    --admin-flow) RAW_SERVICE_ARGS+=("admin-flow"); shift ;;
    --super-flow) RAW_SERVICE_ARGS+=("super-flow"); shift ;;
    --services)
      if [[ -n "${2:-}" ]]; then
        RAW_SERVICE_ARGS+=("$2")
        shift 2
      else
        echo "Error: --services requires a comma-separated or space-separated list of services" >&2
        exit 1
      fi
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      RAW_SERVICE_ARGS+=("$1")
      shift
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
  local target_list="$1"
  for item in $target_list; do
    case "$item" in
      landing) free_port 3000 ;;
      learner) free_port 3001 ;;
      faculty) free_port 3002 ;;
      admin)   free_port 3003 ;;
      auth)    free_port 3004 ;;
      super)   free_port 3005 ;;
      ui)      free_port 6001 ;;
      api)     free_port 8000 ;;
      nginx)   free_port 80 ;;
      pgadmin) free_port 5050 ;;
      postgres) free_port 5432 ;;
      [0-9]*)  free_port "$item" ;;
      *)       ;;
    esac
  done
}

# Process Stop Action
if [[ "$ACTION" == "stop" ]]; then
  TARGET="${TARGET_STOP:-core}"
  if [[ ${#RAW_SERVICE_ARGS[@]} -gt 0 ]]; then
    TARGET="${RAW_SERVICE_ARGS[*]}"
  fi
  EXPANDED_STOP=$(for item in $TARGET; do expand_profile "$item"; done | tr ',' ' ')
  echo "Stopping running process(es) for: $EXPANDED_STOP..."
  free_service_ports "$EXPANDED_STOP"
  exit 0
fi

# Interactive selector if no services specified
if [[ ${#RAW_SERVICE_ARGS[@]} -eq 0 ]]; then
  if [[ -t 0 ]]; then
    echo "=========================================="
    echo "       BayesStack Service Selector        "
    echo "=========================================="
    echo "Core Services (EC2 / Production Ready):"
    echo "  1) core          (All core services: postgres, api, auth, super, learner, faculty, admin, landing, nginx)"
    echo ""
    echo "Lightweight Workflows:"
    echo "  2) super-flow    (postgres, api, super, nginx)"
    echo "  3) learner-flow  (postgres, api, auth, learner, nginx)"
    echo "  4) faculty-flow  (postgres, api, auth, faculty, nginx)"
    echo "  5) admin-flow    (postgres, api, auth, admin, nginx)"
    echo "------------------------------------------"
    echo "Individual App Services:"
    echo "  6) landing       (App - http://localhost:3000)"
    echo "  7) learner       (App - http://localhost:3001)"
    echo "  8) faculty       (App - http://localhost:3002)"
    echo "  9) admin         (App - http://localhost:3003)"
    echo " 10) auth          (App - http://localhost:3004)"
    echo " 11) super         (App - http://localhost:3005)"
    echo " 12) api           (FastAPI - http://localhost:8000)"
    echo " 13) nginx         (Nginx Router - port 80)"
    echo " 14) ui            (Storybook - http://localhost:6001)"
    echo " 15) all           (Start all services + dev tools)"
    echo " 16) stop          (Shut down running ports)"
    echo "=========================================="
    read -r -p "Enter choice [1-16] (default: 1 [core]): " choice
    case "$choice" in
      1|core|minimal) RAW_SERVICE_ARGS+=("core") ;;
      2|super-flow)   RAW_SERVICE_ARGS+=("super-flow") ;;
      3|learner-flow) RAW_SERVICE_ARGS+=("learner-flow") ;;
      4|faculty-flow) RAW_SERVICE_ARGS+=("faculty-flow") ;;
      5|admin-flow)   RAW_SERVICE_ARGS+=("admin-flow") ;;
      6|landing)      RAW_SERVICE_ARGS+=("landing") ;;
      7|learner)      RAW_SERVICE_ARGS+=("learner") ;;
      8|faculty)      RAW_SERVICE_ARGS+=("faculty") ;;
      9|admin)        RAW_SERVICE_ARGS+=("admin") ;;
      10|auth)        RAW_SERVICE_ARGS+=("auth") ;;
      11|super)       RAW_SERVICE_ARGS+=("super") ;;
      12|api)         RAW_SERVICE_ARGS+=("api") ;;
      13|nginx)       RAW_SERVICE_ARGS+=("nginx") ;;
      14|ui)          RAW_SERVICE_ARGS+=("ui") ;;
      15|all)         RAW_SERVICE_ARGS+=("all") ;;
      16|stop)
        read -r -p "Enter service/port to stop [core|all|auth|api|port] (default: core): " TARGET_STOP
        TARGET_STOP="${TARGET_STOP:-core}"
        EXPANDED_STOP=$(expand_profile "$TARGET_STOP" | tr ',' ' ')
        echo "Stopping running process(es) for '$EXPANDED_STOP'..."
        free_service_ports "$EXPANDED_STOP"
        exit 0
        ;;
      "")             RAW_SERVICE_ARGS+=("core") ;;
      *)
        echo "Invalid selection: $choice" >&2
        exit 1
        ;;
    esac
  else
    echo "No service specified and running in non-interactive mode." >&2
    echo "Usage: $0 [--docker|--local] [core|api super nginx|all] or $0 --stop" >&2
    exit 1
  fi
fi

# Expand profiles & resolve all requested service names
EXPANDED_STR=""
for item in "${RAW_SERVICE_ARGS[@]}"; do
  EXPANDED_STR="$EXPANDED_STR $(expand_profile "$item" | tr ',' ' ')"
done

# Deduplicate resolved service list preserving order
SELECTED_SERVICES=()
for svc in $EXPANDED_STR; do
  if [[ ! " ${SELECTED_SERVICES[*]:-} " =~ " ${svc} " ]]; then
    SELECTED_SERVICES+=("$svc")
  fi
done

# Signal trap for graceful cleanup on Ctrl+C (INT) or SIGTERM
PIDS=()
cleanup_on_exit() {
  trap - INT TERM EXIT
  echo ""
  echo "Received interrupt signal. Gracefully shutting down '${SELECTED_SERVICES[*]}'..."
  if [[ -n "${PIDS:-}" && ${#PIDS[@]} -gt 0 ]]; then
    kill "${PIDS[@]}" 2>/dev/null || true
  fi
  free_service_ports "${SELECTED_SERVICES[*]}"
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

  # Filter out non-docker services like 'ui'
  DOCKER_TARGETS=()
  for svc in "${SELECTED_SERVICES[@]}"; do
    if [[ "$svc" != "ui" ]]; then
      DOCKER_TARGETS+=("$svc")
    fi
  done

  # Include postgres database container if api is part of the request
  if [[ " ${DOCKER_TARGETS[*]} " =~ " api " ]] && ! [[ " ${DOCKER_TARGETS[*]} " =~ " postgres " ]]; then
    DOCKER_TARGETS+=("postgres")
  fi

  echo "========================================================="
  echo "  Starting BayesStack in DOCKER Mode                     "
  echo "  Selected Core/Docker Services: ${DOCKER_TARGETS[*]}"
  echo "========================================================="
  
  exec docker compose -f "$ROOT_DIR/compose.yaml" up --build "${DOCKER_TARGETS[@]}"
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
  echo "========================================================="
  echo "  Starting BayesStack in LOCAL (Native) Mode             "
  echo "  Selected Services: ${SELECTED_SERVICES[*]}"
  echo "========================================================="

  free_service_ports "${SELECTED_SERVICES[*]}"

  RUNS_NODE=0
  RUNS_API=0

  for svc in "${SELECTED_SERVICES[@]}"; do
    if [[ "$svc" == "api" ]]; then
      RUNS_API=1
    elif [[ "$svc" != "nginx" && "$svc" != "postgres" && "$svc" != "pgadmin" ]]; then
      RUNS_NODE=1
    fi
  done

  if [[ $RUNS_NODE -eq 1 ]]; then
    run_pnpm install
  fi
  if [[ $RUNS_API -eq 1 ]]; then
    setup_python_api
  fi

  for svc in "${SELECTED_SERVICES[@]}"; do
    case "$svc" in
      api)
        echo "Starting API backend at http://localhost:8000..."
        (
          cd "$ROOT_DIR/services/api"
          exec "$ROOT_DIR/services/api/.venv/bin/python" -m uvicorn main:app --app-dir src --reload --host 0.0.0.0 --port 8000
        ) & PIDS+=("$!")
        ;;
      landing)
        echo "Starting Landing app at http://localhost:3000..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/landing" dev --hostname 0.0.0.0 --port 3000) & PIDS+=("$!")
        ;;
      learner)
        echo "Starting Learner app at http://localhost:3001..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/learner" dev --hostname 0.0.0.0 --port 3001) & PIDS+=("$!")
        ;;
      faculty)
        echo "Starting Faculty app at http://localhost:3002..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/faculty" dev --hostname 0.0.0.0 --port 3002) & PIDS+=("$!")
        ;;
      admin)
        echo "Starting Admin app at http://localhost:3003..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/admin" dev --hostname 0.0.0.0 --port 3003) & PIDS+=("$!")
        ;;
      auth)
        echo "Starting Auth app at http://localhost:3004..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/auth" dev --hostname 0.0.0.0 --port 3004) & PIDS+=("$!")
        ;;
      super)
        echo "Starting SuperAdmin app at http://localhost:3005..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/super" dev --hostname 0.0.0.0 --port 3005) & PIDS+=("$!")
        ;;
      ui)
        echo "Starting UI catalog (Storybook) at http://localhost:6001..."
        (cd "$ROOT_DIR" && run_pnpm --filter "@bayesstack/ui" dev) & PIDS+=("$!")
        ;;
      nginx)
        if command -v nginx >/dev/null 2>&1; then
          echo "Local NGINX detected. Ensure /etc/nginx/conf.d/bayesstack.conf is loaded."
        fi
        ;;
    esac
  done

  echo "Selected services running locally. Press Ctrl+C to stop."
  wait
fi
