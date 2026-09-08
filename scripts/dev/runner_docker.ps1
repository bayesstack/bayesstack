# PowerShell containerized Docker execution runner

function Warmup-DockerFrontends([string[]]$services) {
  $frontendPorts = @{ landing = 3000; learner = 3001; faculty = 3002; admin = 3003; auth = 3004; super = 3005 }
  foreach ($service in $services) {
    if (-not $frontendPorts.ContainsKey($service)) { continue }
    $port = $frontendPorts[$service]
    Write-LogInfo "Warming up $service (initial Next.js compilation may take a moment)..."
    $ready = $false
    for ($attempt = 1; $attempt -le 60; $attempt++) {
      try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) { $ready = $true; break }
      } catch { }
      Start-Sleep -Seconds 2
    }
    if ($ready) { Write-LogSuccess "$service is compiled and ready on port $port." }
    else { Write-LogWarn "$service did not finish warming up within 120 seconds; it may still compile on first use." }
  }
}

function Run-DockerMode([string]$root, [string[]]$services) {
  Test-Prerequisites "docker"

  $dockerTargets = @()
  foreach ($svc in $services) {
    if ($svc -ne "ui") { $dockerTargets += $svc }
  }
  if (($dockerTargets -contains "api") -and ($dockerTargets -notcontains "postgres")) {
    $dockerTargets += "postgres"
  }

  Print-Header "Starting BayesStack in DOCKER Mode"
  Write-LogInfo "Selected Core/Docker Services: $dockerTargets"

  Print-ServiceDashboard "docker" $dockerTargets
  $composeFile = Join-Path $root "compose.yaml"
  docker compose -f $composeFile up --build -d $dockerTargets
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Warmup-DockerFrontends $dockerTargets
  docker compose -f $composeFile logs -f $dockerTargets
  exit $LASTEXITCODE
}
