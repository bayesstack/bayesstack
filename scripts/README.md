# Local startup scripts

`start-local.sh` and `start-local.ps1` are the supported cross-platform entry points. They automatically use Docker when Docker Engine and Docker Compose are available and running. Otherwise they start applications directly on the host.

By default, running the start script without specifying a service launches an interactive menu to choose which service to start (to save system resources and avoid crashing low-RAM devices).

## Usage Examples

```bash
# Linux or macOS - Launches interactive menu to pick service
./scripts/start-local.sh

# Start a specific service directly
./scripts/start-local.sh landing
./scripts/start-local.sh --learner
./scripts/start-local.sh --service faculty

# Start all services simultaneously
./scripts/start-local.sh --all
./scripts/start-local.sh -a

# Force local native mode for a service
./scripts/start-local.sh --local landing

# Force Docker mode for a service
./scripts/start-local.sh --docker landing

# Gracefully shut down a service or port
./scripts/start-local.sh --stop ui       # Gracefully frees port 6001
./scripts/start-local.sh --stop 3000     # Gracefully frees port 3000
./scripts/start-local.sh --stop all      # Gracefully frees all service ports
```

```powershell
# Windows PowerShell - Interactive menu
.\scripts\start-local.ps1

# Start specific service directly
.\scripts\start-local.ps1 -Landing
.\scripts\start-local.ps1 -Service learner

# Start all services
.\scripts\start-local.ps1 -All

# Force native or docker mode
.\scripts\start-local.ps1 -Local -Service admin
.\scripts\start-local.ps1 -Docker -Service api
```

From Command Prompt, run `scripts\start-local.cmd`. Press `Ctrl+C` to stop native mode. Stop Docker mode with `docker compose down`.

