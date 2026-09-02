#!/usr/bin/env bash
# Containerized Docker execution runner

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
  exec docker compose -f "$root_dir/compose.yaml" up --build "${docker_targets[@]}"
}
