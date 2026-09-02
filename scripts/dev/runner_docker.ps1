# PowerShell containerized Docker execution runner

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
  docker compose -f (Join-Path $root "compose.yaml") up --build $dockerTargets
  exit $LASTEXITCODE
}
