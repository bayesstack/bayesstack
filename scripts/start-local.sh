#!/usr/bin/env bash
# BayesStack Master Developer Environment Orchestrator
set -euo pipefail

export PATH="/usr/local/lib/node_modules/corepack/shims:$PATH"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Source Modular Sub-Components
source "$ROOT_DIR/scripts/dev/ui.sh"
source "$ROOT_DIR/scripts/dev/profiles.sh"
source "$ROOT_DIR/scripts/dev/ports.sh"
source "$ROOT_DIR/scripts/dev/prereqs.sh"
source "$ROOT_DIR/scripts/dev/database.sh"
source "$ROOT_DIR/scripts/dev/runner_docker.sh"
source "$ROOT_DIR/scripts/dev/runner_local.sh"

# Auto-initialize .env from .env.example if missing
if [[ ! -f "$ROOT_DIR/.env" ]] && [[ -f "$ROOT_DIR/.env.example" ]]; then
  log_info "No .env file found. Auto-creating .env from .env.example..."
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
fi

MODE="auto"
ACTION="start"
TARGET_STOP=""
RAW_SERVICE_ARGS=()

show_help() {
  echo -e "${CLR_BOLD}${CLR_CYAN}Usage:${CLR_RESET} ./scripts/start-local.sh [options] [core|profile|service1 service2 ...]"
  echo ""
  echo -e "${CLR_BOLD}Options:${CLR_RESET}"
  echo -e "  ${CLR_GREEN}--docker${CLR_RESET}                   Force Docker mode (run services in containerized format)"
  echo -e "  ${CLR_GREEN}--local${CLR_RESET}                    Force Local (native) mode (run services directly in shell)"
  echo -e "  ${CLR_GREEN}--check${CLR_RESET}                    Run a comprehensive system prerequisite & environment health check"
  echo -e "  ${CLR_GREEN}--db-backup${CLR_RESET}                Create a timestamped SQL snapshot backup of PostgreSQL database"
  echo -e "  ${CLR_GREEN}--db-reset${CLR_RESET}                 Reset database schema and re-seed clean default tenants/users"
  echo -e "  ${CLR_GREEN}--db-seed${CLR_RESET}                  Run database seed routine to update tenants & default accounts"
  echo -e "  ${CLR_GREEN}--stop, --kill, -k [name]${CLR_RESET} Gracefully shut down process running on service port(s)"
  echo -e "  ${CLR_GREEN}-h, --help${CLR_RESET}                 Show this help message"
  echo ""
  echo -e "${CLR_BOLD}1. Core Services Profile (EC2 / Production Ready):${CLR_RESET}"
  echo -e "  ${CLR_CYAN}core${CLR_RESET}                       Starts all core services needed to run BayesStack end-to-end:"
  echo -e "                             (postgres, api, auth, super, learner, faculty, admin, landing, nginx)"
  echo -e "                             ${CLR_DIM}Note: Omits dev-only bloat (pgadmin visualizer, storybook UI).${CLR_RESET}"
  echo ""
  echo -e "${CLR_BOLD}2. Selective Execution Examples:${CLR_RESET}"
  echo -e "  ${CLR_DIM}# Native Local Mode:${CLR_RESET}          ./scripts/start-local.sh --local api super nginx auth"
  echo -e "  ${CLR_DIM}# Docker Mode:${CLR_RESET}                ./scripts/start-local.sh --docker core"
  echo -e "  ${CLR_DIM}# Management Commands:${CLR_RESET}        ./scripts/start-local.sh --check | --db-backup | --db-reset"
}

# Parse command line flags & arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker) MODE="docker"; shift ;;
    --local) MODE="local"; shift ;;
    --check|check) ACTION="check"; shift ;;
    --db-backup|db-backup) ACTION="db-backup"; shift ;;
    --db-reset|db-reset) ACTION="db-reset"; shift ;;
    --db-seed|db-seed) ACTION="db-seed"; shift ;;
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
        log_error "Error: --services requires a comma-separated or space-separated list of services"
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

# Handle standalone management actions
case "$ACTION" in
  check)     run_system_check ;;
  db-backup) run_db_backup "$ROOT_DIR" ;;
  db-seed)   run_db_seed "$ROOT_DIR" ;;
  db-reset)  run_db_reset "$ROOT_DIR" ;;
  stop)
    TARGET="${TARGET_STOP:-core}"
    if [[ ${#RAW_SERVICE_ARGS[@]} -gt 0 ]]; then
      TARGET="${RAW_SERVICE_ARGS[*]}"
    fi
    EXPANDED_STOP=$(for item in $TARGET; do expand_profile "$item"; done | tr ',' ' ')
    log_info "Stopping running process(es) for: $EXPANDED_STOP..."
    free_service_ports "$EXPANDED_STOP"
    exit 0
    ;;
esac

# Interactive selector if no services specified
if [[ ${#RAW_SERVICE_ARGS[@]} -eq 0 ]]; then
  if [[ -t 0 ]]; then
    print_header "BayesStack Service Selector"
    echo -e "${CLR_BOLD}Core Services (EC2 / Production Ready):${CLR_RESET}"
    echo -e "  ${CLR_CYAN}1) core${CLR_RESET}          (postgres, api, auth, super, learner, faculty, admin, landing, nginx)"
    echo ""
    echo -e "${CLR_BOLD}Lightweight Workflows:${CLR_RESET}"
    echo -e "  2) super-flow    (postgres, api, super, nginx)"
    echo -e "  3) learner-flow  (postgres, api, auth, learner, nginx)"
    echo -e "  4) faculty-flow  (postgres, api, auth, faculty, nginx)"
    echo -e "  5) admin-flow    (postgres, api, auth, admin, nginx)"
    echo -e "${CLR_DIM}------------------------------------------${CLR_RESET}"
    echo -e "${CLR_BOLD}Individual App Services:${CLR_RESET}"
    echo -e "  6) landing       (App - http://localhost:3000)"
    echo -e "  7) learner       (App - http://localhost:3001)"
    echo -e "  8) faculty       (App - http://localhost:3002)"
    echo -e "  9) admin         (App - http://localhost:3003)"
    echo -e " 10) auth          (App - http://localhost:3004)"
    echo -e " 11) super         (App - http://localhost:3005)"
    echo -e " 12) api           (FastAPI - http://localhost:8000)"
    echo -e " 13) nginx         (Nginx Router - port 80)"
    echo -e " 14) ui            (Storybook - http://localhost:6001)"
    echo -e " 15) all           (Start all services + dev tools)"
    echo -e "${CLR_DIM}------------------------------------------${CLR_RESET}"
    echo -e "${CLR_BOLD}Management Tools:${CLR_RESET}"
    echo -e " 16) check         (Run system environment check)"
    echo -e " 17) db-backup     (Create PostgreSQL snapshot backup)"
    echo -e " 18) db-reset      (Reset database schema & re-seed data)"
    echo -e " 19) stop          (Shut down running ports)"
    echo -e "${CLR_BOLD}${CLR_CYAN}==========================================${CLR_RESET}"
    read -r -p "Enter choice [1-19] (default: 1 [core]): " choice
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
      16|check)       run_system_check ;;
      17|db-backup)   run_db_backup "$ROOT_DIR" ;;
      18|db-reset)    run_db_reset "$ROOT_DIR" ;;
      19|stop)
        read -r -p "Enter service/port to stop [core|all|auth|api|port] (default: core): " TARGET_STOP
        TARGET_STOP="${TARGET_STOP:-core}"
        EXPANDED_STOP=$(expand_profile "$TARGET_STOP" | tr ',' ' ')
        log_info "Stopping running process(es) for '$EXPANDED_STOP'..."
        free_service_ports "$EXPANDED_STOP"
        exit 0
        ;;
      "")             RAW_SERVICE_ARGS+=("core") ;;
      *)
        log_error "Invalid selection: $choice"
        exit 1
        ;;
    esac
  else
    log_error "No service specified and running in non-interactive mode."
    echo "Usage: $0 [--docker|--local] [core|api super nginx|all] or $0 --check or $0 --stop" >&2
    exit 1
  fi
fi

# Resolve service dependencies and expand profile targets
read -r -a SELECTED_SERVICES <<< "$(resolve_services "${RAW_SERVICE_ARGS[@]}")"

# Determine execution mode (Docker vs Local)
if [[ "$MODE" == "docker" ]] || [[ "$MODE" == "auto" && docker_ready ]]; then
  run_docker_mode "$ROOT_DIR" "${SELECTED_SERVICES[@]}"
else
  run_local_mode "$ROOT_DIR" "${SELECTED_SERVICES[@]}"
fi
