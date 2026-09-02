# PowerShell Terminal UI styling, colors, and dashboard renderer

function Write-LogInfo([string]$msg) {
  Write-Host "ℹ️  $msg" -ForegroundColor Cyan
}

function Write-LogSuccess([string]$msg) {
  Write-Host "✔ $msg" -ForegroundColor Green
}

function Write-LogWarn([string]$msg) {
  Write-Host "⚠️  $msg" -ForegroundColor Yellow
}

function Write-LogError([string]$msg) {
  Write-Host "✖ $msg" -ForegroundColor Red
}

function Print-Header([string]$title) {
  Write-Host ""
  Write-Host "==========================================================================" -ForegroundColor Cyan
  Write-Host "  $title" -ForegroundColor Cyan
  Write-Host "==========================================================================" -ForegroundColor Cyan
}

function Print-ServiceDashboard([string]$mode, [string[]]$services) {
  Write-Host ""
  Write-Host "==========================================================================" -ForegroundColor Cyan
  Write-Host "               🚀 BayesStack Active Service Dashboard                    " -ForegroundColor Cyan
  Write-Host "               Mode: $($mode.ToUpper()) | Status: RUNNING                   " -ForegroundColor Cyan
  Write-Host "==========================================================================" -ForegroundColor Cyan
  foreach ($svc in $services) {
    switch ($svc) {
      "landing"  { Write-Host "  - Landing Site:        http://localhost:3000  (or http://bayesstack.localhost)" }
      "learner"  { Write-Host "  - Learner Portal:      http://localhost:3001  (or http://ashoka.localhost)" }
      "faculty"  { Write-Host "  - Faculty Portal:      http://localhost:3002  (or http://coep.localhost)" }
      "admin"    { Write-Host "  - Admin Portal:        http://localhost:3003  (or http://vjti.localhost)" }
      "auth"     { Write-Host "  - Auth Gateway:        http://localhost:3004  (or http://auth.localhost)" }
      "super"    { Write-Host "  - SuperAdmin Studio:   http://localhost:3005  (or http://super.localhost)" }
      "api"      { Write-Host "  - FastAPI Backend:     http://localhost:8000  (API Docs: http://localhost:8000/docs)" }
      "nginx"    { Write-Host "  - Nginx Router:        http://localhost       (Port 80 Subdomain Ingress)" }
      "postgres" { Write-Host "  - PostgreSQL Database: localhost:5432       (Database: bayesstack)" }
      "ui"       { Write-Host "  - Storybook UI:        http://localhost:6001" }
      "pgadmin"  { Write-Host "  - PgAdmin Visualizer:  http://localhost:5050" }
    }
  }
  Write-Host "==========================================================================" -ForegroundColor Cyan
  Write-Host "  Press Ctrl+C to gracefully stop all active services." -ForegroundColor Yellow
  Write-Host "==========================================================================" -ForegroundColor Cyan
  Write-Host ""
}
