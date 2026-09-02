# Database operations, snapshot backup, reset, and Python environment setup for PowerShell

function Setup-PythonApi([string]$root) {
  $pyCmd = (Get-Command python -ErrorAction SilentlyContinue).Source
  if (-not $pyCmd) { $pyCmd = (Get-Command python3 -ErrorAction SilentlyContinue).Source }
  if (-not $pyCmd) { $pyCmd = (Get-Command py -ErrorAction SilentlyContinue).Source }
  if (-not $pyCmd) { throw "Python 3 is required for the API." }

  $Venv = Join-Path $root "services/api/.venv"
  $VenvPython = Join-Path $Venv "Scripts/python.exe"
  if (-not (Test-Path $VenvPython)) {
    $VenvPython = Join-Path $Venv "bin/python"
  }
  if (-not (Test-Path $VenvPython)) {
    Write-LogInfo "Setting up Python virtual environment at $Venv..."
    & $pyCmd -m venv $Venv
  }
  Write-LogInfo "Verifying FastAPI backend dependencies..."
  & $VenvPython -m pip install -e (Join-Path $root "services/api") *> $null
  return $VenvPython
}

function Run-DbBackup([string]$root) {
  $backupDir = Join-Path $root "scripts/backups"
  if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
  $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $backupFile = Join-Path $backupDir "bayesstack_backup_$timestamp.sql"

  Write-LogInfo "Creating PostgreSQL database snapshot backup..."
  if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    $env:PGPASSWORD = "bayesstack_dev"
    pg_dump -h localhost -p 5432 -U bayesstack -d bayesstack > $backupFile
  }
  if ((-not (Test-Path $backupFile) -or (Get-Item $backupFile).Length -eq 0) -and (Test-DockerReady)) {
    docker exec bayesstack_postgres pg_dump -U bayesstack -d bayesstack > $backupFile
  }

  if ((Test-Path $backupFile) -and (Get-Item $backupFile).Length -gt 0) {
    Write-LogSuccess "Database backup created: $backupFile"
  } else {
    Write-LogError "Failed to create database backup. Ensure PostgreSQL is running."
  }
  exit 0
}

function Run-DbSeed([string]$root) {
  $VenvPython = Setup-PythonApi $root
  Write-LogInfo "Running database seed routine..."
  Push-Location (Join-Path $root "services/api")
  & $VenvPython -m db.seed
  Pop-Location
  Write-LogSuccess "Database seed routine completed successfully."
  exit 0
}

function Run-DbReset([string]$root) {
  $VenvPython = Setup-PythonApi $root
  Write-LogWarn "Resetting BayesStack database schema and re-seeding default data..."
  Push-Location (Join-Path $root "services/api")
  $code = @"
import asyncio, sys, os
sys.path.insert(0, os.path.abspath('src'))
from core.database import engine, Base
from db.seed import seed_database

async def reset():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await seed_database()

asyncio.run(reset())
"@
  & $VenvPython -c $code
  Pop-Location
  Write-LogSuccess "Database schema reset and re-seeded successfully."
  exit 0
}
