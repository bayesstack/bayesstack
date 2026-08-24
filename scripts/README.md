# Local startup scripts

`start-local.sh` and `start-local.ps1` are the supported cross-platform entry points. They automatically use Docker when Docker Engine and Docker Compose are available and running. Otherwise they start the same applications directly on the host.

```bash
# Linux or macOS
./scripts/start-local.sh

# Force native mode
./scripts/start-local.sh --local

# Force Docker mode
./scripts/start-local.sh --docker
```

```powershell
# Windows PowerShell
.\scripts\start-local.ps1

# Force native mode
.\scripts\start-local.ps1 -Local
```

From Command Prompt, run `scripts\start-local.cmd`. Press `Ctrl+C` to stop native mode. Stop Docker mode with `docker compose down`.
