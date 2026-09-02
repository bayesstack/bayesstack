# Service profile mappings & resolution routines for PowerShell

function Expand-Profile([string]$target) {
  switch ($target.ToLower()) {
    "core"         { return "postgres", "api", "auth", "super", "learner", "faculty", "admin", "landing", "nginx" }
    "minimal"      { return "postgres", "api", "auth", "super", "learner", "faculty", "admin", "landing", "nginx" }
    "learner-flow" { return "postgres", "api", "auth", "learner", "nginx" }
    "faculty-flow" { return "postgres", "api", "auth", "faculty", "nginx" }
    "admin-flow"   { return "postgres", "api", "auth", "admin", "nginx" }
    "super-flow"   { return "postgres", "api", "super", "nginx" }
    "all"          { return "postgres", "api", "landing", "learner", "faculty", "admin", "auth", "super", "ui", "pgadmin", "nginx" }
    default        { return $target }
  }
}

function Resolve-Services([string[]]$rawArgs) {
  $selected = @()
  foreach ($arg in $rawArgs) {
    $expanded = Expand-Profile $arg
    foreach ($svc in $expanded) {
      if ($selected -notcontains $svc) {
        $selected += $svc
      }
    }
  }
  return $selected
}
