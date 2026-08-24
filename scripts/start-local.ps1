param(
  [switch]$Docker,
  [switch]$Local,
  [string]$Service,
  [switch]$All,
  [switch]$Landing,
  [switch]$Learner,
  [switch]$Faculty,
  [switch]$Admin,
  [switch]$Ui,
  [switch]$Api,
  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$PositionalArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if ($All) { $Service = "all" }
elseif ($Landing) { $Service = "landing" }
elseif ($Learner) { $Service = "learner" }
elseif ($Faculty) { $Service = "faculty" }
elseif ($Admin) { $Service = "admin" }
elseif ($Ui) { $Service = "ui" }
elseif ($Api) { $Service = "api" }
elseif ($PositionalArgs -and $PositionalArgs.Count -gt 0) {
  $Service = $PositionalArgs[0]
}

if ([string]::IsNullOrWhiteSpace($Service)) {
  Write-Host "=========================================="
  Write-Host "       BayesStack Service Selector        "
  Write-Host "=========================================="
  Write-Host "Which service would you like to start?"
  Write-Host "  1) landing   (App - http://localhost:3000)"
  Write-Host "  2) learner   (App - http://localhost:3001)"
  Write-Host "  3) faculty   (App - http://localhost:3002)"
  Write-Host "  4) admin     (App - http://localhost:3003)"
  Write-Host "  5) ui        (Storybook - http://localhost:6001)"
  Write-Host "  6) api       (FastAPI - http://localhost:8000)"
  Write-Host "  7) all       (Start all services - High CPU/RAM)"
  Write-Host "=========================================="
  $Choice = Read-Host "Enter choice [1-7] (default: 1)"
  switch ($Choice) {
    "1" { $Service = "landing" }
    "2" { $Service = "learner" }
    "3" { $Service = "faculty" }
    "4" { $Service = "admin" }
    "5" { $Service = "ui" }
    "6" { $Service = "api" }
    "7" { $Service = "all" }
    "landing" { $Service = "landing" }
    "learner" { $Service = "learner" }
    "faculty" { $Service = "faculty" }
    "admin" { $Service = "admin" }
    "ui" { $Service = "ui" }
    "api" { $Service = "api" }
    "all" { $Service = "all" }
    "" { $Service = "landing" }
    default {
      Write-Host "Unknown selection, defaulting to 'landing'."
      $Service = "landing"
    }
  }
}

function Test-DockerReady {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return $false }
  try {
    docker compose version *> $null
    docker info *> $null
    return $true
  } catch { return $false }
}

if ($Docker -or (-not $Local -and (Test-DockerReady))) {
  if (-not (Test-DockerReady)) { throw "Docker and Docker Compose must be installed and running." }
  if ($Service -eq "all") {
    Write-Host "Starting all services in Docker mode..."
    docker compose -f (Join-Path $Root "compose.yaml") up --build
  } elseif ($Service -eq "ui") {
    Write-Host "UI (Storybook) is not configured in Docker Compose. Running locally..."
    $Docker = $false
  } else {
    Write-Host "Starting $Service in Docker mode..."
    docker compose -f (Join-Path $Root "compose.yaml") up --build $Service
  }
  if ($Docker -or (Test-DockerReady)) { exit $LASTEXITCODE }
}

function Invoke-Pnpm([string[]]$Arguments) {
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    & pnpm @Arguments
  } elseif (Get-Command corepack -ErrorAction SilentlyContinue) {
    & corepack pnpm @Arguments
  } elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    & npx --yes pnpm@11.23.0 @Arguments
  } else {
    throw "pnpm, Corepack, or npx is required for local mode."
  }
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js is required for local mode." }

function Setup-PythonApi {
  $PythonCommand = (Get-Command python -ErrorAction SilentlyContinue).Source
  if (-not $PythonCommand) { $PythonCommand = (Get-Command py -ErrorAction SilentlyContinue).Source }
  if (-not $PythonCommand) { throw "Python 3 is required for the API." }

  $Venv = Join-Path $Root "services/api/.venv"
  $VenvPython = Join-Path $Venv "Scripts/python.exe"
  if (-not (Test-Path $VenvPython)) {
    $VenvPython = Join-Path $Venv "bin/python"
  }
  if (-not (Test-Path $VenvPython)) {
    Push-Location $Root
    & $PythonCommand -m venv $Venv
    Pop-Location
  }
  & $VenvPython -m pip install -e (Join-Path $Root "services/api") *> $null
  return $VenvPython
}

Push-Location $Root

switch ($Service) {
  "landing" {
    Invoke-Pnpm @("install")
    Write-Host "Starting Landing app at http://localhost:3000..."
    Invoke-Pnpm @("--filter", "@bayesstack/landing", "dev", "--hostname", "0.0.0.0", "--port", "3000")
  }
  "learner" {
    Invoke-Pnpm @("install")
    Write-Host "Starting Learner app at http://localhost:3001..."
    Invoke-Pnpm @("--filter", "@bayesstack/learner", "dev", "--hostname", "0.0.0.0", "--port", "3001")
  }
  "faculty" {
    Invoke-Pnpm @("install")
    Write-Host "Starting Faculty app at http://localhost:3002..."
    Invoke-Pnpm @("--filter", "@bayesstack/faculty", "dev", "--hostname", "0.0.0.0", "--port", "3002")
  }
  "admin" {
    Invoke-Pnpm @("install")
    Write-Host "Starting Admin app at http://localhost:3003..."
    Invoke-Pnpm @("--filter", "@bayesstack/admin", "dev", "--hostname", "0.0.0.0", "--port", "3003")
  }
  "ui" {
    Invoke-Pnpm @("install")
    Write-Host "Starting UI catalog (Storybook) at http://localhost:6001..."
    Invoke-Pnpm @("--filter", "@bayesstack/ui", "dev")
  }
  "api" {
    $VenvPython = Setup-PythonApi
    Write-Host "Starting API backend at http://localhost:8000/health..."
    Set-Location (Join-Path $Root "services/api")
    & $VenvPython -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
  }
  "all" {
    Invoke-Pnpm @("install")
    $VenvPython = Setup-PythonApi

    function Start-PnpmApp([string]$Name, [int]$Port) {
      $Arguments = @("--filter", "@bayesstack/$Name", "dev", "--hostname", "0.0.0.0", "--port", "$Port")
      if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        return Start-Process pnpm -ArgumentList $Arguments -WorkingDirectory $Root -NoNewWindow -PassThru
      }
      if (Get-Command corepack -ErrorAction SilentlyContinue) {
        return Start-Process corepack -ArgumentList (@("pnpm") + $Arguments) -WorkingDirectory $Root -NoNewWindow -PassThru
      }
      return Start-Process npx -ArgumentList (@("--yes", "pnpm@11.23.0") + $Arguments) -WorkingDirectory $Root -NoNewWindow -PassThru
    }

    function Start-PnpmUi {
      $Arguments = @("--filter", "@bayesstack/ui", "dev")
      if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        return Start-Process pnpm -ArgumentList $Arguments -WorkingDirectory $Root -NoNewWindow -PassThru
      }
      if (Get-Command corepack -ErrorAction SilentlyContinue) {
        return Start-Process corepack -ArgumentList (@("pnpm") + $Arguments) -WorkingDirectory $Root -NoNewWindow -PassThru
      }
      return Start-Process npx -ArgumentList (@("--yes", "pnpm@11.23.0") + $Arguments) -WorkingDirectory $Root -NoNewWindow -PassThru
    }

    $Processes = @()
    $Processes += Start-Process $VenvPython -ArgumentList @("-m", "uvicorn", "api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000") -WorkingDirectory (Join-Path $Root "services/api") -NoNewWindow -PassThru
    $Processes += Start-PnpmApp "landing" 3000
    $Processes += Start-PnpmApp "learner" 3001
    $Processes += Start-PnpmApp "faculty" 3002
    $Processes += Start-PnpmApp "admin" 3003
    $Processes += Start-PnpmUi

    Write-Host "BayesStack is running all services in local mode. Press Ctrl+C to stop."
    Write-Host "Landing: http://localhost:3000"
    Write-Host "Learner: http://localhost:3001"
    Write-Host "Faculty: http://localhost:3002"
    Write-Host "Admin:   http://localhost:3003"
    Write-Host "UI:      http://localhost:6001"
    Write-Host "API:     http://localhost:8000/health"
    Wait-Process -Id ($Processes.Id)
  }
  default {
    throw "Unknown service '$Service'."
  }
}
Pop-Location
