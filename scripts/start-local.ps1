param(
  [switch]$Docker,
  [switch]$Local
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

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
  docker compose -f (Join-Path $Root "compose.yaml") up --build
  exit $LASTEXITCODE
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
Push-Location $Root
Invoke-Pnpm @("install")
Pop-Location

$PythonCommand = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $PythonCommand) { $PythonCommand = (Get-Command py -ErrorAction SilentlyContinue).Source }
if (-not $PythonCommand) { throw "Python 3 is required for the API." }

$Venv = Join-Path $Root "services/api/.venv"
$VenvPython = Join-Path $Venv "Scripts/python.exe"
if (-not (Test-Path $VenvPython)) {
  Push-Location $Root
  & $PythonCommand -m venv $Venv
  Pop-Location
}
& $VenvPython -m pip install -e (Join-Path $Root "services/api") *> $null

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

$Processes = @()
$Processes += Start-Process $VenvPython -ArgumentList @("-m", "uvicorn", "api.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000") -WorkingDirectory (Join-Path $Root "services/api") -NoNewWindow -PassThru
$Processes += Start-PnpmApp "landing" 3000
$Processes += Start-PnpmApp "learner" 3001
$Processes += Start-PnpmApp "faculty" 3002
$Processes += Start-PnpmApp "admin" 3003

Write-Host "BayesStack is running in local mode. Press Ctrl+C to stop."
Write-Host "Landing: http://localhost:3000"
Write-Host "Learner: http://localhost:3001"
Write-Host "Faculty: http://localhost:3002"
Write-Host "Admin:   http://localhost:3003"
Write-Host "API:     http://localhost:8000/health"
Wait-Process -Id ($Processes.Id)
