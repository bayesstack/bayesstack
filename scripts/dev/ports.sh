#!/usr/bin/env bash
# Port discovery, socket inspection, and process lifecycle management

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
    log_info "Port $port is in use by PID(s): $pids. Gracefully shutting down..."
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
        log_warn "PID $pid on port $port did not exit gracefully; force killing (SIGKILL)..."
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
    log_success "Port $port gracefully freed."
  fi
}

free_service_ports() {
  local target_list="$1"
  local preserve_infrastructure="${2:-false}"
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
      # PostgreSQL can be a separately managed local service (or a persistent
      # Docker container), so do not stop it as part of a native app restart.
      postgres)
        if [[ "$preserve_infrastructure" != "true" ]]; then
          free_port 5432
        fi
        ;;
      [0-9]*)  free_port "$item" ;;
      *)       ;;
    esac
  done
}

setup_signal_traps() {
  # Trap handlers run after this function returns, so store their state in
  # globals instead of function-local variables.
  BAYESSTACK_TRAP_PIDS_REF="$1"
  BAYESSTACK_TRAP_TARGET_SVCS="$2"

  cleanup_on_exit() {
    trap - INT TERM EXIT
    local -n pids_ref="$BAYESSTACK_TRAP_PIDS_REF"
    local target_svcs="$BAYESSTACK_TRAP_TARGET_SVCS"
    echo ""
    log_info "Received interrupt signal. Shutting down '${target_svcs}'..."
    if [[ -n "${pids_ref:-}" && ${#pids_ref[@]} -gt 0 ]]; then
      kill "${pids_ref[@]}" 2>/dev/null || true
    fi
    free_service_ports "${target_svcs}" true
    log_success "BayesStack services shut down gracefully."
    exit 0
  }
  trap cleanup_on_exit INT TERM
}
