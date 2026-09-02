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

function Start-PnpmProcess([string]$root, [string[]]$Arguments) {
  $pnpmCommand = Get-Command "pnpm.cmd" -ErrorAction SilentlyContinue
  if ($pnpmCommand) {
    return Start-Process -FilePath $pnpmCommand.Source -ArgumentList $Arguments -WorkingDirectory $root -NoNewWindow -PassThru
  }

  $corepackCommand = Get-Command "corepack.cmd" -ErrorAction SilentlyContinue
  if ($corepackCommand) {
    return Start-Process -FilePath $corepackCommand.Source -ArgumentList (@("pnpm") + $Arguments) -WorkingDirectory $root -NoNewWindow -PassThru
  }

  throw "pnpm.cmd or corepack.cmd is required to start frontend applications in local mode."
}

function Test-LocalPort([int]$Port) {
  try {
    $connection = New-Object System.Net.Sockets.TcpClient("127.0.0.1", $Port)
    $isOpen = $connection.Connected
    $connection.Close()
    return $isOpen
  } catch {
    return $false
  }
}

function Ensure-NativePostgres {
  if (Test-LocalPort 5432) {
    Write-LogInfo "Using local PostgreSQL already listening on port 5432."
    return
  }

  $postgresService = Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "^postgresql" -or $_.DisplayName -match "PostgreSQL" } |
    Select-Object -First 1

  if (-not $postgresService) {
    throw "PostgreSQL is not listening on port 5432 and no local PostgreSQL Windows service was found. Start PostgreSQL, then run this command again."
  }

  Write-LogInfo "Starting local PostgreSQL service '$($postgresService.Name)'..."
  try {
    Start-Service -Name $postgresService.Name -ErrorAction Stop
  } catch {
    throw "Could not start PostgreSQL service '$($postgresService.Name)'. Start it from an elevated PowerShell or Windows Services, then run this command again."
  }

  for ($attempt = 1; $attempt -le 15; $attempt++) {
    if (Test-LocalPort 5432) {
      Write-LogSuccess "Local PostgreSQL is ready on port 5432."
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "PostgreSQL service started but did not begin listening on port 5432. Check the PostgreSQL service logs."
}

function Resolve-NativeNginx([string]$root) {
  $systemNginx = Get-Command nginx -ErrorAction SilentlyContinue
  if ($systemNginx) { return $systemNginx.Source }

  $nginxVersion = $env:BAYESSTACK_NGINX_VERSION
  if ([string]::IsNullOrWhiteSpace($nginxVersion)) { $nginxVersion = "1.28.0" }
  $toolsDir = Join-Path $root ".local-tools/nginx"
  $nginxHome = Join-Path $toolsDir "nginx-$nginxVersion"
  $nginxExe = Join-Path $nginxHome "nginx.exe"

  if (-not (Test-Path $nginxExe)) {
    $archivePath = Join-Path $toolsDir "nginx-$nginxVersion.zip"
    New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
    Write-LogInfo "Downloading Nginx $nginxVersion for native local routing..."
    Invoke-WebRequest -Uri "https://nginx.org/download/nginx-$nginxVersion.zip" -OutFile $archivePath -UseBasicParsing
    Expand-Archive -Path $archivePath -DestinationPath $toolsDir -Force
    Remove-Item -LiteralPath $archivePath -Force
  }

  if (-not (Test-Path $nginxExe)) {
    throw "Nginx installation did not produce the expected executable: $nginxExe"
  }
  return $nginxExe
}

function Start-NativeNginx([string]$root) {
  $nginxExe = Resolve-NativeNginx $root
  $nginxHome = Split-Path -Parent $nginxExe
  $configPath = Join-Path $root "infra/nginx/nginx.local.conf"

  if (-not (Test-Path $configPath)) {
    throw "Native Nginx configuration is missing: $configPath"
  }

  Write-LogInfo "Validating native Nginx configuration..."
  & $nginxExe -t -p $nginxHome -c $configPath
  if ($LASTEXITCODE -ne 0) {
    throw "Native Nginx configuration validation failed."
  }

  Write-LogInfo "Starting native Nginx router at http://localhost..."
  $nginxArguments = "-p `"$nginxHome`" -c `"$configPath`""
  return Start-Process -FilePath $nginxExe -ArgumentList $nginxArguments -WorkingDirectory $nginxHome -PassThru
}

function Stop-NativeNginx([string]$root) {
  $nginxVersion = $env:BAYESSTACK_NGINX_VERSION
  if ([string]::IsNullOrWhiteSpace($nginxVersion)) { $nginxVersion = "1.28.0" }
  $nginxExe = Join-Path $root ".local-tools/nginx/nginx-$nginxVersion/nginx.exe"
  if (-not (Test-Path $nginxExe)) { return }

  $nginxHome = Split-Path -Parent $nginxExe
  $configPath = Join-Path $root "infra/nginx/nginx.local.conf"
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    & $nginxExe -p $nginxHome -c $configPath -s quit *> $null
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Stop-ProcessTree([int]$ProcessId) {
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    taskkill /F /T /PID $ProcessId *> $null
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Stop-StaleApiProcesses {
  $staleListenerIds = @()
  for ($attempt = 1; $attempt -le 10; $attempt++) {
    $listenerProcesses = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
    if (-not $listenerProcesses) { break }

    $staleListenerIds += $listenerProcesses

    foreach ($processId in $listenerProcesses) {
      Stop-ProcessTree $processId
    }
    Start-Sleep -Milliseconds 250
  }

  $staleProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "uvicorn\s+main:app.*--port\s+8000" }

  foreach ($process in $staleProcesses) {
    Stop-ProcessTree $process.ProcessId
  }

  # Uvicorn's former --reload workers can outlive their parent on Windows.
  # They are safe to remove only when their vanished parent owned port 8000.
  foreach ($process in Get-CimInstance Win32_Process -ErrorAction SilentlyContinue) {
    if ($staleListenerIds -contains $process.ParentProcessId -and
        $process.CommandLine -match "multiprocessing\.spawn") {
      Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
  }
}

function Run-LocalMode([string]$root, [string[]]$services) {
  Test-Prerequisites "local"

  Print-Header "Starting BayesStack in LOCAL (Native) Mode"
  Write-LogInfo "Selected Services: $services"

  # PostgreSQL is a persistent local service, not a child process of this runner.
  # Preserve it while clearing stale API, frontend, and Nginx processes.
  if ($services -contains "nginx") { Stop-NativeNginx $root }
  Free-ServicePorts $services -PreserveInfrastructure
  if ($services -contains "api") { Stop-StaleApiProcesses }

  $runsNode = $false
  $runsApi = $false

  foreach ($svc in $services) {
    if ($svc -eq "api") { $runsApi = $true }
    elseif ($svc -ne "nginx" -and $svc -ne "postgres" -and $svc -ne "pgadmin") { $runsNode = $true }
  }

  if ($runsApi) {
    Ensure-NativePostgres
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
        $Processes += Start-Process $VenvPython -ArgumentList @("-m", "uvicorn", "main:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "8000") -WorkingDirectory (Join-Path $root "services/api") -NoNewWindow -PassThru
      }
      "nginx" {
        $Processes += Start-NativeNginx $root
      }
      "landing" {
        Write-LogInfo "Starting Landing app at http://localhost:3000..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/landing", "dev", "--hostname", "0.0.0.0", "--port", "3000")
      }
      "learner" {
        Write-LogInfo "Starting Learner app at http://localhost:3001..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/learner", "dev", "--hostname", "0.0.0.0", "--port", "3001")
      }
      "faculty" {
        Write-LogInfo "Starting Faculty app at http://localhost:3002..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/faculty", "dev", "--hostname", "0.0.0.0", "--port", "3002")
      }
      "admin" {
        Write-LogInfo "Starting Admin app at http://localhost:3003..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/admin", "dev", "--hostname", "0.0.0.0", "--port", "3003")
      }
      "auth" {
        Write-LogInfo "Starting Auth app at http://localhost:3004..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/auth", "dev", "--hostname", "0.0.0.0", "--port", "3004")
      }
      "super" {
        Write-LogInfo "Starting SuperAdmin app at http://localhost:3005..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/super", "dev", "--hostname", "0.0.0.0", "--port", "3005")
      }
      "ui" {
        Write-LogInfo "Starting UI catalog (Storybook) at http://localhost:6001..."
        $Processes += Start-PnpmProcess $root @("--filter", "@bayesstack/ui", "dev")
      }
    }
  }

  Print-ServiceDashboard "local" $services
  if ($Processes) {
    Wait-Process -Id ($Processes.Id)
  }
  Pop-Location
}
