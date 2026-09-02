# Port management and process cleanup routines for PowerShell

function Free-Port([int]$port) {
  try {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
      $pids = $connections.OwningProcess | Select-Object -Unique
      foreach ($procId in $pids) {
        if ($procId -gt 4) {
          Write-LogInfo "Port $port is in use by PID: $procId. Freeing port..."
          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
      }
    }
  } catch {
    $netstat = netstat -ano | Select-String ":$port "
    if ($netstat) {
      foreach ($line in $netstat) {
        $parts = $line.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
        $procId = $parts[-1]
        if ($procId -match '^\d+$' -and [int]$procId -gt 4) {
          taskkill /F /PID $procId *> $null
        }
      }
    }
  }
}

function Free-ServicePorts([string[]]$targetList) {
  foreach ($item in $targetList) {
    switch ($item) {
      "landing"  { Free-Port 3000 }
      "learner"  { Free-Port 3001 }
      "faculty"  { Free-Port 3002 }
      "admin"    { Free-Port 3003 }
      "auth"     { Free-Port 3004 }
      "super"    { Free-Port 3005 }
      "ui"       { Free-Port 6001 }
      "api"      { Free-Port 8000 }
      "nginx"    { Free-Port 80 }
      "pgadmin"  { Free-Port 5050 }
      "postgres" { Free-Port 5432 }
    }
  }
}
