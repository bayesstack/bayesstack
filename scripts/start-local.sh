#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/lib/node_modules/corepack/shims:$PATH"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="auto"
SERVICE=""
ACTION="start"
TARGET_STOP=""
SELECTED_SERVICES=()

show_help() {
  echo "Usage: ./scripts/start-local.sh [options] [profile|service|list]"
  echo ""
  echo "Options:"
  echo "  --docker                   Force Docker mode"
  echo "  --local                    Force Local (native) mode"
  echo "  --stop, --kill, -k [name] Gracefully shut down process running on service port(s)"
  echo "  -h, --help                 Show this help message"
  echo ""
  echo "Development Profiles (Lightweight):"
  echo "  core                       API + Auth (Minimal CPU/RAM: http://bayes.localhost)"
  echo "  learner-flow               API + Auth + Learner"
  echo "  faculty-flow               API + Auth + Faculty"
  echo "  admin-flow                 API + Auth + Admin"
  echo "  super-flow                 API + SuperAdmin"
  echo "  all                        Start all 9 services (High CPU/RAM)"
  echo ""
  echo "Individual Services:"
  echo "  landing                    Start Landing app (http://localhost:3000)"
  echo "  learner                    Start Learner app (http://localhost:3001)"
  echo "  faculty                    Start Faculty app (http://localhost:3002)"
  echo "  admin                      Start Admin app (http://localhost:3003)"
  echo "  auth                       Start Auth app (http://localhost:3004)"
  echo "  super                      Start SuperAdmin app (http://localhost:3005)"
  echo "  ui                         Start UI Storybook catalog (http://localhost:6001)"
  echo "  api                        Start FastAPI backend (http://localhost:8000)"
  echo ""
  echo "Custom Selection:"
  echo "  --services api,auth,learner  Run specific comma-separated list of services"
  echo ""
  echo "Examples:"
  echo "  ./scripts/start-local.sh --core"
  echo "  ./scripts/start-local.sh --learner-flow"
  echo "  ./scripts/start-local.sh --services api,auth"
  echo "  ./scripts/start-local.sh --stop core"
}

expand_profile() {
  local target="$1"
  case "$target" in
    core|minimal) echo "api auth nginx" ;;
    learner-flow) echo "api auth learner nginx" ;;
    faculty-flow) echo "api auth faculty nginx" ;;
    admin-flow)   echo "api auth admin nginx" ;;
    super-flow)   echo "api super nginx" ;;
    all)          echo "api landing learner faculty admin auth super ui nginx" ;;
    *)            echo "$target" ;;
  esac
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
    --core|--minimal) SERVICE="core"; shift ;;
    --learner-flow) SERVICE="learner-flow"; shift ;;
    --faculty-flow) SERVICE="faculty-flow"; shift ;;
    --admin-flow) SERVICE="admin-flow"; shift ;;
    --super-flow) SERVICE="super-flow"; shift ;;
    --landing) SERVICE="landing"; shift ;;
    --learner) SERVICE="learner"; shift ;;
    --faculty) SERVICE="faculty"; shift ;;
    --admin) SERVICE="admin"; shift ;;
    --auth) SERVICE="auth"; shift ;;
    --super) SERVICE="super"; shift ;;
    --ui) SERVICE="ui"; shift ;;
    --api) SERVICE="api"; shift ;;
    --services)
      if [[ -n "${2:-}" ]]; then
        SERVICE="$2"
        shift 2
      else
        echo "Error: --services requires a comma-separated list (e.g. api,auth)" >&2
        exit 1
      fi
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    core|minimal|learner-flow|faculty-flow|admin-flow|super-flow|landing|learner|faculty|admin|auth|super|ui|api|all)
      SERVICE="$1"
      shift
      ;;
    *)
      if [[ "$1" == *","* ]]; then
        SERVICE="$1"
        shift
      else
        echo "Unknown option: $1" >&2
        show_help >&2
        exit 1
      fi
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
  local raw_target="${1:-$SERVICE}"
  local list
  list=$(expand_profile "$raw_target" | tr ',' ' ')
  
  for item in $list; do
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
      [0-9]*)  free_port "$item" ;;
      *)       ;;
    esac
  done
}

if [[ "$ACTION" == "stop" ]]; then
  TARGET="${TARGET_STOP:-$SERVICE}"
  if [[ -z "$TARGET" ]]; then
    if [[ -t 0 ]]; then
      read -r -p "Enter profile/service/port to stop [core|all|landing|api|port] (default: all): " TARGET
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
    echo "Lightweight Profiles (Low CPU/RAM):"
    echo "  1) core          (API + Auth Gateway - http://bayes.localhost)"
    echo "  2) learner-flow  (API + Auth + Learner)"
    echo "  3) faculty-flow  (API + Auth + Faculty)"
    echo "  4) admin-flow    (API + Auth + Admin)"
    echo "  5) super-flow    (API + SuperAdmin - http://super.localhost)"
    echo "------------------------------------------"
    echo "Individual App Services:"
    echo "  6) landing       (App - http://localhost:3000)"
    echo "  7) learner       (App - http://localhost:3001)"
    echo "  8) faculty       (App - http://localhost:3002)"
    echo "  9) admin         (App - http://localhost:3003)"
    echo " 10) auth          (App - http://localhost:3004)"
    echo " 11) super         (App - http://localhost:3005)"
    echo " 12) ui            (Storybook - http://localhost:6001)"
    echo " 13) api           (FastAPI - http://localhost:8000)"
    echo " 14) all           (Start all services - High CPU/RAM)"
    echo " 15) stop          (Gracefully shut down running ports)"
    echo "=========================================="
    read -r -p "Enter choice [1-15] (default: 1 [core]): " choice
    case "$choice" in
      1|core|minimal) SERVICE="core" ;;
      2|learner-flow) SERVICE="learner-flow" ;;
      3|faculty-flow) SERVICE="faculty-flow" ;;
      4|admin-flow)   SERVICE="admin-flow" ;;
      5|super-flow)   SERVICE="super-flow" ;;
      6|landing)      SERVICE="landing" ;;
      7|learner)      SERVICE="learner" ;;
      8|faculty)      SERVICE="faculty" ;;
      9|admin)        SERVICE="admin" ;;
      10|auth)        SERVICE="auth" ;;
      11|super)       SERVICE="super" ;;
      12|ui)          SERVICE="ui" ;;
      13|api)         SERVICE="api" ;;
      14|all)         SERVICE="all" ;;
      15|stop)
        read -r -p "Enter service/port to stop [core|all|auth|api|port] (default: all): " TARGET_STOP
        TARGET_STOP="${TARGET_STOP:-all}"
        echo "Stopping running process(es) for '$TARGET_STOP'..."
        free_service_ports "$TARGET_STOP"
        exit 0
        ;;
      "")             SERVICE="core" ;;
      *)
        echo "Invalid selection: $choice" >&2
        exit 1
        ;;
    esac
  else
    echo "No service specified and running in non-interactive mode." >&2
    echo "Usage: $0 [--core|--learner-flow|--super-flow|--services api,auth|all] or $0 --stop" >&2
    exit 1
  fi
fi

# Expand selected profile / comma list into list of service names
EXPANDED_SERVICES=$(expand_profile "$SERVICE" | tr ',' ' ')
IFS=' ' read -r -a SELECTED_SERVICES <<< "$EXPANDED_SERVICES"

# Signal trap for graceful cleanup on Ctrl+C (INT) or SIGTERM
PIDS=()
cleanup_on_exit() {
  trap - INT TERM EXIT
  echo ""
  echo "Received interrupt signal. Gracefully shutting down '${SELECTED_SERVICES[*]}'..."
  if [[ -n "${PIDS:-}" && ${#PIDS[@]} -gt 0 ]]; then
    kill "${PIDS[@]}" 2>/dev/null || true
  fi
  free_service_ports "$SERVICE"
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

  echo "Starting BayesStack in Docker mode for target services: ${DOCKER_TARGETS[*]}..."
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
  echo "Starting BayesStack in Local mode for targets: ${SELECTED_SERVICES[*]}..."
  free_service_ports "$SERVICE"

  RUNS_NODE=0
  RUNS_API=0

  for svc in "${SELECTED_SERVICES[@]}"; do
    if [[ "$svc" == "api" ]]; then
      RUNS_API=1
    elif [[ "$svc" != "nginx" ]]; then
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
        echo "Starting API backend at http://localhost:8000/health..."
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
