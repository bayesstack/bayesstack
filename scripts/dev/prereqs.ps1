# Pre-flight environment check & prerequisite validator for PowerShell

function Test-DockerReady {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return $false }
  try {
    docker compose version *> $null
    docker info *> $null
    return $true
  } catch { return $false }
}

function Run-SystemCheck {
  Print-Header "BayesStack Local System Environment Check"
  $errors = 0

  # Git
  if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-LogSuccess "Git: $((git --version))"
  } else {
    Write-LogError "Git is NOT installed."
    $errors++
  }

  # Node
  if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-LogSuccess "Node.js: $((node --version))"
  } else {
    Write-LogError "Node.js is NOT installed."
    $errors++
  }

  # Package manager
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-LogSuccess "pnpm: v$((pnpm --version))"
  } elseif (Get-Command corepack -ErrorAction SilentlyContinue) {
    Write-LogSuccess "Corepack enabled"
  } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-LogSuccess "npm: $((npm --version))"
  } else {
    Write-LogError "No JS package manager (pnpm/corepack/npm) found."
    $errors++
  }

  # Python
  $pyCmd = (Get-Command python -ErrorAction SilentlyContinue).Source
  if (-not $pyCmd) { $pyCmd = (Get-Command python3 -ErrorAction SilentlyContinue).Source }
  if (-not $pyCmd) { $pyCmd = (Get-Command py -ErrorAction SilentlyContinue).Source }

  if ($pyCmd) {
    Write-LogSuccess "Python: $(& $pyCmd --version 2>&1)"
  } else {
    Write-LogError "Python 3 is NOT installed."
    $errors++
  }

  # PostgreSQL CLI & Port
  if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-LogSuccess "PostgreSQL Client (psql): $((psql --version))"
  } else {
    Write-LogWarn "'psql' client CLI not found."
  }

  $pgPortOpen = $false
  try {
    $conn = New-Object System.Net.Sockets.TcpClient("127.0.0.1", 5432)
    if ($conn.Connected) { $pgPortOpen = $true; $conn.Close() }
  } catch {}

  if ($pgPortOpen) {
    Write-LogSuccess "PostgreSQL Service: Active and listening on port 5432"
  } else {
    Write-LogWarn "PostgreSQL Service is NOT detected on port 5432."
  }

  # Docker
  if (Test-DockerReady) {
    Write-LogSuccess "Docker Daemon: Active & Accessible"
  } else {
    Write-LogInfo "Docker CLI/Daemon not detected or not active."
  }

  Write-Host "=========================================================" -ForegroundColor Cyan
  if ($errors -eq 0) {
    Write-LogSuccess "System Check Passed! Your local system is fully prepared."
  } else {
    Write-LogError "System Check Found $errors Requirement Issue(s)."
  }
  Write-Host "=========================================================" -ForegroundColor Cyan
  if ($errors -gt 0) { exit 1 } else { exit 0 }
}

function Test-Prerequisites([string]$targetMode) {
  # Fast pre-flight check logic
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-LogError "Git is missing."
    exit 1
  }

  if ($targetMode -eq "docker") {
    if (-not (Test-DockerReady)) {
      Write-LogError "Docker Desktop and Docker Compose must be installed and running."
      exit 1
    }
  } else {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
      Write-LogError "Node.js is missing."
      exit 1
    }
  }
}
