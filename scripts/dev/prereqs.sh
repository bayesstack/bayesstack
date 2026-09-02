#!/usr/bin/env bash
# Pre-flight environment & prerequisite verification module

run_system_check() {
  print_header "BayesStack Local System Environment Check"
  local errors=0

  # 1. Git
  if command -v git >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Git:${CLR_RESET} $(git --version)"
  else
    echo -e "  [${ICON_FAIL}] ${CLR_BOLD}Git is NOT installed.${CLR_RESET} ('sudo apt-get install git' or 'brew install git')"
    errors=$((errors + 1))
  fi

  # 2. Node.js
  if command -v node >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Node.js:${CLR_RESET} $(node --version)"
  else
    echo -e "  [${ICON_FAIL}] ${CLR_BOLD}Node.js is NOT installed.${CLR_RESET} ('https://nodejs.org/' or 'nvm install 22')"
    errors=$((errors + 1))
  fi

  # 3. JS Package Manager
  if command -v pnpm >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}pnpm:${CLR_RESET} v$(pnpm --version 2>/dev/null || echo 'installed')"
  elif command -v corepack >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Corepack:${CLR_RESET} $(corepack --version 2>/dev/null || echo 'installed')"
  elif command -v npm >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}npm:${CLR_RESET} $(npm --version 2>/dev/null || echo 'installed')"
  else
    echo -e "  [${ICON_FAIL}] ${CLR_BOLD}No JS package manager found.${CLR_RESET} ('npm install -g pnpm' or 'corepack enable')"
    errors=$((errors + 1))
  fi

  # 4. Python 3
  if command -v python3 >/dev/null 2>&1; then
    PY_VER=$(python3 --version 2>&1)
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Python:${CLR_RESET} $PY_VER"
  elif command -v python >/dev/null 2>&1; then
    PY_VER=$(python --version 2>&1)
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Python:${CLR_RESET} $PY_VER"
  else
    echo -e "  [${ICON_FAIL}] ${CLR_BOLD}Python 3 is NOT installed.${CLR_RESET} ('sudo apt-get install python3 python3-venv' or 'brew install python')"
    errors=$((errors + 1))
  fi

  # 5. Python venv module
  if command -v python3 >/dev/null 2>&1; then
    if python3 -c "import venv" >/dev/null 2>&1; then
      echo -e "  [${ICON_OK}] ${CLR_BOLD}Python venv module:${CLR_RESET} Available"
    else
      echo -e "  [${ICON_FAIL}] ${CLR_BOLD}Python 'venv' module missing.${CLR_RESET} ('sudo apt-get install python3-venv')"
      errors=$((errors + 1))
    fi
  fi

  # 6. PostgreSQL Client & Socket
  if command -v psql >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}PostgreSQL Client (psql):${CLR_RESET} $(psql --version)"
  else
    echo -e "  [${ICON_WARN}] ${CLR_BOLD}psql client CLI not found.${CLR_RESET} ('sudo apt-get install postgresql-client')"
  fi

  local pg_port_open=0
  if command -v lsof >/dev/null 2>&1 && lsof -i:5432 >/dev/null 2>&1; then
    pg_port_open=1
  elif command -v ss >/dev/null 2>&1 && ss -lptn "sport = :5432" 2>/dev/null | grep -q "5432"; then
    pg_port_open=1
  fi

  if [[ $pg_port_open -eq 1 ]]; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}PostgreSQL Service:${CLR_RESET} Active and listening on port 5432"
  else
    echo -e "  [${ICON_WARN}] ${CLR_BOLD}PostgreSQL Service:${CLR_RESET} NOT detected on port 5432."
    echo -e "         ${CLR_DIM}(Start local postgres service or run 'docker compose up -d postgres')${CLR_RESET}"
  fi

  # 7. Nginx Reverse Proxy
  if command -v nginx >/dev/null 2>&1; then
    echo -e "  [${ICON_OK}] ${CLR_BOLD}Nginx Reverse Proxy:${CLR_RESET} $(nginx -v 2>&1)"
  else
    echo -e "  [${ICON_INFO}] ${CLR_BOLD}Nginx:${CLR_RESET} Not installed locally. (Optional; fallback to direct port access)"
  fi

  # 8. Docker & Docker Daemon
  if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      echo -e "  [${ICON_OK}] ${CLR_BOLD}Docker Daemon:${CLR_RESET} Active & Accessible"
    else
      echo -e "  [${ICON_WARN}] ${CLR_BOLD}Docker CLI installed, but Docker daemon is not active.${CLR_RESET}"
    fi
  else
    echo -e "  [${ICON_INFO}] ${CLR_BOLD}Docker CLI:${CLR_RESET} Not installed. (Optional for local native execution)"
  fi

  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  if [[ $errors -eq 0 ]]; then
    log_success "🎉 System Check Passed! Your local system is fully prepared to run BayesStack."
  else
    log_error "⚠️ System Check Found $errors Requirement Issue(s). Please install missing dependencies listed above."
  fi
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  exit $errors
}

check_prerequisites() {
  local target_mode="$1"
  local missing=()
  local recommendations=()

  if ! command -v git >/dev/null 2>&1; then
    missing+=("git")
    recommendations+=("  - git: Install via 'sudo apt-get install git' or 'brew install git'")
  fi

  if [[ "$target_mode" == "docker" ]]; then
    if ! command -v docker >/dev/null 2>&1; then
      missing+=("docker")
      recommendations+=("  - docker: Install Docker Desktop or 'sudo apt-get install docker.io' (https://docs.docker.com/get-docker/)")
    fi

    if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
      missing+=("docker compose")
      recommendations+=("  - docker compose: Install Docker Compose v2 plugin ('sudo apt-get install docker-compose-v2')")
    fi

    if command -v docker >/dev/null 2>&1 && ! docker info >/dev/null 2>&1; then
      log_error "Docker daemon is not running or current user lacks socket permissions."
      log_info "Recommendation: Start Docker daemon ('sudo systemctl start docker') or grant permissions ('sudo usermod -aG docker \$USER')."
      exit 1
    fi
  else
    if ! command -v node >/dev/null 2>&1; then
      missing+=("node")
      recommendations+=("  - node: Install Node.js v20/v22 via 'https://nodejs.org/' or 'nvm install 22'")
    fi

    if ! command -v pnpm >/dev/null 2>&1 && ! command -v corepack >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
      missing+=("pnpm/npm")
      recommendations+=("  - pnpm/npm: Install pnpm via 'npm install -g pnpm' or 'corepack enable'")
    fi

    if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
      missing+=("python3")
      recommendations+=("  - python3: Install Python 3.10+ via 'sudo apt-get install python3 python3-venv' or 'brew install python'")
    fi

    if command -v python3 >/dev/null 2>&1 && ! python3 -c "import venv" >/dev/null 2>&1; then
      missing+=("python3-venv")
      recommendations+=("  - python3-venv: Install via 'sudo apt-get install python3-venv'")
    fi
  fi

  if [[ ${#missing[@]} -gt 0 ]]; then
    print_header "Missing System Prerequisites for '$target_mode' mode: ${missing[*]}"
    for rec in "${recommendations[@]}"; do
      echo -e "$rec" >&2
    done
    exit 1
  fi
}

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 && docker info >/dev/null 2>&1
}
