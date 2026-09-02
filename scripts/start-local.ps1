# PowerShell Master Developer Environment Orchestrator for Windows
[CmdletBinding()]
param(
  [switch]$Docker,
  [switch]$Local,
  [switch]$Check,
  [switch]$DbBackup,
  [switch]$DbReset,
  [switch]$DbSeed,
  [string]$Stop,
  [switch]$Help,
  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$PositionalArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DevDir = Join-Path $PSScriptRoot "dev"

# Source Modular Sub-Components
. (Join-Path $DevDir "ui.ps1")
. (Join-Path $DevDir "profiles.ps1")
. (Join-Path $DevDir "ports.ps1")
. (Join-Path $DevDir "prereqs.ps1")
. (Join-Path $DevDir "database.ps1")
. (Join-Path $DevDir "runner_docker.ps1")
. (Join-Path $DevDir "runner_local.ps1")

# Auto-initialize .env from .env.example if missing
$EnvPath = Join-Path $Root ".env"
$EnvExamplePath = Join-Path $Root ".env.example"
if (-not (Test-Path $EnvPath) -and (Test-Path $EnvExamplePath)) {
  Write-LogInfo "No .env file found. Auto-creating .env from .env.example..."
  Copy-Item $EnvExamplePath $EnvPath
}

function Show-Help {
  Write-Host "Usage: .\scripts\start-local.ps1 [options] [core|profile|service1 service2 ...]" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Options:" -ForegroundColor Yellow
  Write-Host "  -Docker                   Force Docker mode (run services in containerized format)"
  Write-Host "  -Local                    Force Local (native) mode (run services directly in shell)"
  Write-Host "  -Check                    Run a comprehensive system prerequisite & environment health check"
  Write-Host "  -DbBackup                 Create a timestamped SQL snapshot backup of PostgreSQL database"
  Write-Host "  -DbReset                  Reset database schema and re-seed clean default tenants/users"
  Write-Host "  -DbSeed                   Run database seed routine to update tenants & default accounts"
  Write-Host "  -Stop [name]              Gracefully shut down process running on service port(s)"
  Write-Host "  -Help                     Show this help message"
  Write-Host ""
  Write-Host "Execution Examples:" -ForegroundColor Yellow
  Write-Host "  .\scripts\start-local.ps1 -Local core"
  Write-Host "  .\scripts\start-local.ps1 -Docker api super nginx"
  Write-Host "  .\scripts\start-local.ps1 -Check | -DbBackup | -DbReset"
}

if ($Help) {
  Show-Help
  exit 0
}

# Standalone actions
if ($Check)    { Run-SystemCheck }
if ($DbBackup) { Run-DbBackup $Root }
if ($DbSeed)   { Run-DbSeed $Root }
if ($DbReset)  { Run-DbReset $Root }
if ($Stop) {
  $stopTargets = Expand-Profile $Stop
  Write-LogInfo "Stopping running processes for: $stopTargets..."
  Free-ServicePorts $stopTargets
  exit 0
}

# Resolve target services from arguments
$RawArgs = @()
if ($PositionalArgs) { $RawArgs += $PositionalArgs }

if ($RawArgs.Count -eq 0) {
  Print-Header "BayesStack Service Selector"
  Write-Host "Core Services (EC2 / Production Ready):"
  Write-Host "  1) core          (postgres, api, auth, super, learner, faculty, admin, landing, nginx)"
  Write-Host ""
  Write-Host "Lightweight Workflows:"
  Write-Host "  2) super-flow    (postgres, api, super, nginx)"
  Write-Host "  3) learner-flow  (postgres, api, auth, learner, nginx)"
  Write-Host "  4) faculty-flow  (postgres, api, auth, faculty, nginx)"
  Write-Host "  5) admin-flow    (postgres, api, auth, admin, nginx)"
  Write-Host "------------------------------------------"
  Write-Host "Individual App Services:"
  Write-Host "  6) landing       (App - http://localhost:3000)"
  Write-Host "  7) learner       (App - http://localhost:3001)"
  Write-Host "  8) faculty       (App - http://localhost:3002)"
  Write-Host "  9) admin         (App - http://localhost:3003)"
  Write-Host " 10) auth          (App - http://localhost:3004)"
  Write-Host " 11) super         (App - http://localhost:3005)"
  Write-Host " 12) api           (FastAPI - http://localhost:8000)"
  Write-Host " 13) nginx         (Nginx Router - port 80)"
  Write-Host " 14) ui            (Storybook - http://localhost:6001)"
  Write-Host " 15) all           (Start all services + dev tools)"
  Write-Host "------------------------------------------"
  Write-Host "Management Tools:"
  Write-Host " 16) check         (Run system environment check)"
  Write-Host " 17) db-backup     (Create PostgreSQL snapshot backup)"
  Write-Host " 18) db-reset      (Reset database schema & re-seed data)"
  Write-Host " 19) stop          (Shut down running ports)"
  Write-Host "==========================================" -ForegroundColor Cyan
  $choice = Read-Host "Enter choice [1-19] (default: 1 [core])"
  switch ($choice) {
    "1"  { $RawArgs += "core" }
    "2"  { $RawArgs += "super-flow" }
    "3"  { $RawArgs += "learner-flow" }
    "4"  { $RawArgs += "faculty-flow" }
    "5"  { $RawArgs += "admin-flow" }
    "6"  { $RawArgs += "landing" }
    "7"  { $RawArgs += "learner" }
    "8"  { $RawArgs += "faculty" }
    "9"  { $RawArgs += "admin" }
    "10" { $RawArgs += "auth" }
    "11" { $RawArgs += "super" }
    "12" { $RawArgs += "api" }
    "13" { $RawArgs += "nginx" }
    "14" { $RawArgs += "ui" }
    "15" { $RawArgs += "all" }
    "16" { Run-SystemCheck }
    "17" { Run-DbBackup $Root }
    "18" { Run-DbReset $Root }
    "19" {
      $stopSvc = Read-Host "Enter service/port to stop (default: core)"
      if ([string]::IsNullOrWhiteSpace($stopSvc)) { $stopSvc = "core" }
      Free-ServicePorts (Expand-Profile $stopSvc)
      exit 0
    }
    ""   { $RawArgs += "core" }
    default { $RawArgs += $choice }
  }
}

$SelectedServices = Resolve-Services $RawArgs

# Determine execution mode (Docker vs Local)
$useDocker = $false
if ($Docker) {
  $useDocker = $true
} elseif (-not $Local -and (Test-DockerReady)) {
  $useDocker = $true
}

if ($useDocker) {
  Run-DockerMode $Root $SelectedServices
} else {
  Run-LocalMode $Root $SelectedServices
}
