#!/usr/bin/env bash
# Database management, seeding, SQL backup, reset, and Python environment setup

setup_python_api() {
  local root_dir="$1"
  local python_cmd=""

  if command -v python3 >/dev/null 2>&1; then
    python_cmd="python3"
  elif command -v python >/dev/null 2>&1; then
    python_cmd="python"
  fi

  if [[ -z "$python_cmd" ]]; then
    log_error "Python 3 is required for the API."
    exit 1
  fi

  local venv_dir="$root_dir/services/api/.venv"
  if [[ ! -x "$venv_dir/bin/python" ]]; then
    log_info "Setting up Python virtual environment at $venv_dir..."
    "$python_cmd" -m venv "$venv_dir"
  fi

  log_info "Verifying FastAPI backend dependencies..."
  "$venv_dir/bin/python" -m pip install -e "$root_dir/services/api" >/dev/null
}

run_db_backup() {
  local root_dir="$1"
  local backup_dir="$root_dir/scripts/backups"
  mkdir -p "$backup_dir"

  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local backup_file="$backup_dir/bayesstack_backup_${timestamp}.sql"

  log_info "Creating PostgreSQL database snapshot backup..."
  if command -v pg_dump >/dev/null 2>&1; then
    PGPASSWORD="${POSTGRES_PASSWORD:-bayesstack_dev}" pg_dump -h "${POSTGRES_HOST:-localhost}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-bayesstack}" -d "${POSTGRES_DB:-bayesstack}" > "$backup_file" 2>/dev/null || true
  fi

  if [[ ! -s "$backup_file" ]] && command -v docker >/dev/null 2>&1 && docker ps | grep -q "bayesstack_postgres"; then
    docker exec bayesstack_postgres pg_dump -U bayesstack -d bayesstack > "$backup_file"
  fi

  if [[ -s "$backup_file" ]]; then
    log_success "Database backup successfully created: $backup_file"
    exit 0
  else
    log_error "Failed to create database backup. Ensure PostgreSQL is running on port 5432 or Docker container 'bayesstack_postgres' is active."
    exit 1
  fi
}

run_db_seed() {
  local root_dir="$1"
  log_info "Running database seed routine..."
  setup_python_api "$root_dir"
  (
    cd "$root_dir/services/api"
    exec "$root_dir/services/api/.venv/bin/python" -m db.seed
  )
  log_success "Database seed routine completed successfully."
  exit 0
}

run_db_reset() {
  local root_dir="$1"
  log_warn "Resetting BayesStack database schema and re-seeding default data..."
  setup_python_api "$root_dir"
  (
    cd "$root_dir/services/api"
    exec "$root_dir/services/api/.venv/bin/python" -c "
import asyncio, sys, os
sys.path.insert(0, os.path.abspath('src'))
from core.database import engine, Base
from db.seed import seed_database

async def reset():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await seed_database()

asyncio.run(reset())
"
  )
  log_success "Database schema reset and re-seeded successfully."
  exit 0
}
