#!/usr/bin/env bash
# Containerized Docker execution runner

warmup_docker_frontends() {
  local service port attempt
  for service in "$@"; do
    case "$service" in
      landing) port=3000 ;;
      learner) port=3001 ;;
      faculty) port=3002 ;;
      admin) port=3003 ;;
      auth) port=3004 ;;
      super) port=3005 ;;
      *) continue ;;
    esac

    log_info "Warming up $service (initial Next.js compilation may take a moment)..."
    for attempt in {1..60}; do
      if curl --silent --show-error --fail --max-time 10 "http://127.0.0.1:${port}/" >/dev/null 2>&1; then
        log_success "$service is compiled and ready on port $port."
        break
      fi
      if [[ "$attempt" -eq 60 ]]; then
        log_warn "$service did not finish warming up within 120 seconds; it may still compile on first use."
      else
        sleep 2
      fi
    done
  done
}

run_docker_mode() {
  local root_dir="$1"
  shift
  local selected_services=("$@")

  check_prerequisites "docker"

  # Filter out non-docker services like 'ui'
  local docker_targets=()
  for svc in "${selected_services[@]}"; do
    if [[ "$svc" != "ui" ]]; then
      docker_targets+=("$svc")
    fi
  done

  # Auto-include postgres database container if api is part of request
  if [[ " ${docker_targets[*]} " =~ " api " ]] && ! [[ " ${docker_targets[*]} " =~ " postgres " ]]; then
    docker_targets+=("postgres")
  fi

  print_header "Starting BayesStack in DOCKER Containerized Mode"
  log_info "Selected Container Services: ${docker_targets[*]}"

  print_service_dashboard "docker" "${docker_targets[@]}"
  docker compose -f "$root_dir/compose.yaml" up --build -d "${docker_targets[@]}"
  local compose_status=$?
  if [[ $compose_status -ne 0 ]]; then
    return $compose_status
  fi

  warmup_docker_frontends "${docker_targets[@]}"
  docker compose -f "$root_dir/compose.yaml" logs -f "${docker_targets[@]}"
}
