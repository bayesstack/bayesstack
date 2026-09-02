#!/usr/bin/env bash
# Native local process execution runner

run_local_mode() {
  local root_dir="$1"
  shift
  local selected_services=("$@")

  check_prerequisites "local"

  run_pnpm() {
    if command -v pnpm >/dev/null 2>&1; then
      pnpm "$@"
    elif command -v corepack >/dev/null 2>&1; then
      corepack pnpm "$@"
    elif command -v npx >/dev/null 2>&1; then
      npx --yes pnpm@11.23.0 "$@"
    else
      log_error "pnpm, Corepack, or npx is required for local mode."
      exit 1
    fi
  }

  cd "$root_dir"
  print_header "Starting BayesStack in LOCAL (Native) Shell Mode"
  log_info "Selected Native Services: ${selected_services[*]}"

  # PostgreSQL is persistent infrastructure, not a child of this runner.
  # Preserve an existing native service or Docker container on application
  # restarts; it is also reused by subsequent local runs.
  free_service_ports "${selected_services[*]}" true

  local runs_node=0
  local runs_api=0

  for svc in "${selected_services[@]}"; do
    if [[ "$svc" == "api" ]]; then
      runs_api=1
    elif [[ "$svc" != "nginx" && "$svc" != "postgres" && "$svc" != "pgadmin" ]]; then
      runs_node=1
    fi
  done

  # Reuse native PostgreSQL when present; otherwise start the lightweight
  # PostgreSQL Compose service. This also makes `--local postgres` useful.
  if [[ $runs_api -eq 1 || " ${selected_services[*]} " =~ " postgres " ]]; then
    local pg_port_open=0
    if command -v lsof >/dev/null 2>&1 && lsof -i:5432 >/dev/null 2>&1; then
      pg_port_open=1
    elif command -v ss >/dev/null 2>&1 && ss -lptn "sport = :5432" 2>/dev/null | grep -q "5432"; then
      pg_port_open=1
    fi

    if [[ $pg_port_open -eq 0 ]] && command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
      log_info "No local PostgreSQL service detected on port 5432. Auto-starting Docker PostgreSQL container..."
      docker compose -f "$root_dir/compose.yaml" up -d postgres
      for _ in {1..30}; do
        if command -v lsof >/dev/null 2>&1 && lsof -i:5432 >/dev/null 2>&1; then
          pg_port_open=1
          break
        elif command -v ss >/dev/null 2>&1 && ss -lptn "sport = :5432" 2>/dev/null | grep -q "5432"; then
          pg_port_open=1
          break
        fi
        sleep 1
      done
    fi

    if [[ $pg_port_open -eq 0 ]]; then
      log_error "PostgreSQL is not reachable on port 5432. Start PostgreSQL or Docker, then try again."
      exit 1
    fi
  fi

  if [[ $runs_node -eq 1 ]]; then
    log_info "Verifying pnpm workspace node_modules..."
    run_pnpm install
  fi

  if [[ $runs_api -eq 1 ]]; then
    setup_python_api "$root_dir"
  fi

  PIDS=()
  setup_signal_traps PIDS "${selected_services[*]}"

  for svc in "${selected_services[@]}"; do
    case "$svc" in
      api)
        log_info "Starting API backend at http://localhost:8000..."
        (
          cd "$root_dir/services/api"
          # A repository .env may have POSTGRES_HOST=postgres for Compose.
          # Native processes must instead reach the host-published database.
          POSTGRES_HOST="${BAYESSTACK_LOCAL_POSTGRES_HOST:-localhost}" \
          DATABASE_URL="${BAYESSTACK_LOCAL_DATABASE_URL:-}" \
            exec "$root_dir/services/api/.venv/bin/python" -m uvicorn main:app --app-dir src --reload --host 0.0.0.0 --port 8000
        ) & PIDS+=("$!")
        ;;
      landing)
        log_info "Starting Landing app at http://localhost:3000..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/landing" dev --hostname 0.0.0.0 --port 3000) & PIDS+=("$!")
        ;;
      learner)
        log_info "Starting Learner app at http://localhost:3001..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/learner" dev --hostname 0.0.0.0 --port 3001) & PIDS+=("$!")
        ;;
      faculty)
        log_info "Starting Faculty app at http://localhost:3002..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/faculty" dev --hostname 0.0.0.0 --port 3002) & PIDS+=("$!")
        ;;
      admin)
        log_info "Starting Admin app at http://localhost:3003..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/admin" dev --hostname 0.0.0.0 --port 3003) & PIDS+=("$!")
        ;;
      auth)
        log_info "Starting Auth app at http://localhost:3004..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/auth" dev --hostname 0.0.0.0 --port 3004) & PIDS+=("$!")
        ;;
      super)
        log_info "Starting SuperAdmin app at http://localhost:3005..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/super" dev --hostname 0.0.0.0 --port 3005) & PIDS+=("$!")
        ;;
      ui)
        log_info "Starting UI catalog (Storybook) at http://localhost:6001..."
        (cd "$root_dir" && run_pnpm --filter "@bayesstack/ui" dev) & PIDS+=("$!")
        ;;
      nginx)
        if command -v nginx >/dev/null 2>&1; then
          log_info "Local NGINX detected. Ensure /etc/nginx/conf.d/bayesstack.conf is loaded."
        fi
        ;;
    esac
  done

  print_service_dashboard "local" "${selected_services[@]}"
  wait
}
