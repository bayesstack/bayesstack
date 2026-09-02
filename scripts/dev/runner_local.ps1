# PowerShell native local process execution runner

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
}

function Run-LocalMode([string]$root, [string[]]$services) {
  Test-Prerequisites "local"

  Print-Header "Starting BayesStack in LOCAL (Native) Mode"
  Write-LogInfo "Selected Services: $services"

  Free-ServicePorts $services

  $runsNode = $false
  $runsApi = $false

  foreach ($svc in $services) {
    if ($svc -eq "api") { $runsApi = $true }
    elseif ($svc -ne "nginx" -and $svc -ne "postgres" -and $svc -ne "pgadmin") { $runsNode = $true }
  }

  if ($runsApi) {
    $pgPortOpen = $false
    try {
      $conn = New-Object System.Net.Sockets.TcpClient("127.0.0.1", 5432)
      if ($conn.Connected) { $pgPortOpen = $true; $conn.Close() }
    } catch {}

    if (-not $pgPortOpen -and (Test-DockerReady)) {
      Write-LogInfo "No local PostgreSQL service detected on port 5432. Auto-starting Docker PostgreSQL container..."
      docker compose -f (Join-Path $root "compose.yaml") up -d postgres
      Start-Sleep -Seconds 2
    }
  }

  if ($runsNode) {
    Write-LogInfo "Verifying pnpm workspace node_modules..."
    Invoke-Pnpm @("install")
  }

  if ($runsApi) {
    $VenvPython = Setup-PythonApi $root
  }

  $Processes = @()
  Push-Location $root

  foreach ($svc in $services) {
    switch ($svc) {
      "api" {
        Write-LogInfo "Starting API backend at http://localhost:8000..."
        $Processes += Start-Process $VenvPython -ArgumentList @("-m", "uvicorn", "main:app", "--app-dir", "src", "--reload", "--host", "0.0.0.0", "--port", "8000") -WorkingDirectory (Join-Path $root "services/api") -NoNewWindow -PassThru
      }
      "landing" {
        Write-LogInfo "Starting Landing app at http://localhost:3000..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/landing", "dev", "--hostname", "0.0.0.0", "--port", "3000") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "learner" {
        Write-LogInfo "Starting Learner app at http://localhost:3001..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/learner", "dev", "--hostname", "0.0.0.0", "--port", "3001") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "faculty" {
        Write-LogInfo "Starting Faculty app at http://localhost:3002..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/faculty", "dev", "--hostname", "0.0.0.0", "--port", "3002") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "admin" {
        Write-LogInfo "Starting Admin app at http://localhost:3003..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/admin", "dev", "--hostname", "0.0.0.0", "--port", "3003") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "auth" {
        Write-LogInfo "Starting Auth app at http://localhost:3004..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/auth", "dev", "--hostname", "0.0.0.0", "--port", "3004") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "super" {
        Write-LogInfo "Starting SuperAdmin app at http://localhost:3005..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/super", "dev", "--hostname", "0.0.0.0", "--port", "3005") -WorkingDirectory $root -NoNewWindow -PassThru
      }
      "ui" {
        Write-LogInfo "Starting UI catalog (Storybook) at http://localhost:6001..."
        $Processes += Start-Process pnpm -ArgumentList @("--filter", "@bayesstack/ui", "dev") -WorkingDirectory $root -NoNewWindow -PassThru
      }
    }
  }

  Print-ServiceDashboard "local" $services
  if ($Processes) {
    Wait-Process -Id ($Processes.Id)
  }
  Pop-Location
}
