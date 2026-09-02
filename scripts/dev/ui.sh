#!/usr/bin/env bash
# Terminal UI styling, ANSI colors, icons, and formatted dashboards

# ANSI Color & Style Tokens
if [[ -t 1 ]]; then
  CLR_RESET="\033[0m"
  CLR_BOLD="\033[1m"
  CLR_DIM="\033[2m"
  CLR_CYAN="\033[36m"
  CLR_GREEN="\033[32m"
  CLR_YELLOW="\033[33m"
  CLR_RED="\033[31m"
  CLR_BLUE="\033[34m"
  CLR_MAGENTA="\033[35m"
else
  CLR_RESET=""
  CLR_BOLD=""
  CLR_DIM=""
  CLR_CYAN=""
  CLR_GREEN=""
  CLR_YELLOW=""
  CLR_RED=""
  CLR_BLUE=""
  CLR_MAGENTA=""
fi

# Standard Status Icons
ICON_OK="${CLR_GREEN}✔${CLR_RESET}"
ICON_WARN="${CLR_YELLOW}⚠️${CLR_RESET}"
ICON_FAIL="${CLR_RED}✖${CLR_RESET}"
ICON_INFO="${CLR_CYAN}ℹ${CLR_RESET}"
ICON_ROCKET="🚀"

log_info() {
  echo -e "${ICON_INFO} ${CLR_CYAN}$*${CLR_RESET}"
}

log_success() {
  echo -e "${ICON_OK} ${CLR_GREEN}$*${CLR_RESET}"
}

log_warn() {
  echo -e "${ICON_WARN} ${CLR_YELLOW}$*${CLR_RESET}"
}

log_error() {
  echo -e "${ICON_FAIL} ${CLR_RED}$*${CLR_RESET}" >&2
}

print_header() {
  local title="$1"
  echo -e ""
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  echo -e "  ${CLR_BOLD}${title}${CLR_RESET}"
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
}

print_service_dashboard() {
  local target_mode="$1"
  shift
  local active_list=("$@")

  echo ""
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  echo -e "               ${ICON_ROCKET} ${CLR_BOLD}BayesStack Active Service Dashboard${CLR_RESET}"
  echo -e "               ${CLR_DIM}Mode:${CLR_RESET} ${CLR_BOLD}${target_mode^^}${CLR_RESET} | ${CLR_DIM}Status:${CLR_RESET} ${CLR_GREEN}${CLR_BOLD}RUNNING${CLR_RESET}"
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"

  for svc in "${active_list[@]}"; do
    case "$svc" in
      landing)  echo -e "  ${CLR_BOLD}- Landing Site:${CLR_RESET}        ${CLR_BLUE}http://localhost:3000${CLR_RESET}  ${CLR_DIM}(or http://bayesstack.localhost)${CLR_RESET}" ;;
      learner)  echo -e "  ${CLR_BOLD}- Learner Portal:${CLR_RESET}      ${CLR_BLUE}http://localhost:3001${CLR_RESET}  ${CLR_DIM}(or http://ashoka.localhost)${CLR_RESET}" ;;
      faculty)  echo -e "  ${CLR_BOLD}- Faculty Portal:${CLR_RESET}      ${CLR_BLUE}http://localhost:3002${CLR_RESET}  ${CLR_DIM}(or http://coep.localhost)${CLR_RESET}" ;;
      admin)    echo -e "  ${CLR_BOLD}- Admin Portal:${CLR_RESET}        ${CLR_BLUE}http://localhost:3003${CLR_RESET}  ${CLR_DIM}(or http://vjti.localhost)${CLR_RESET}" ;;
      auth)     echo -e "  ${CLR_BOLD}- Auth Gateway:${CLR_RESET}        ${CLR_BLUE}http://localhost:3004${CLR_RESET}  ${CLR_DIM}(or http://auth.localhost)${CLR_RESET}" ;;
      super)    echo -e "  ${CLR_BOLD}- SuperAdmin Studio:${CLR_RESET}   ${CLR_BLUE}http://localhost:3005${CLR_RESET}  ${CLR_DIM}(or http://super.localhost)${CLR_RESET}" ;;
      api)      echo -e "  ${CLR_BOLD}- FastAPI Backend:${CLR_RESET}     ${CLR_BLUE}http://localhost:8000${CLR_RESET}  ${CLR_DIM}(Docs: http://localhost:8000/docs)${CLR_RESET}" ;;
      nginx)    echo -e "  ${CLR_BOLD}- Nginx Router:${CLR_RESET}        ${CLR_BLUE}http://localhost${CLR_RESET}       ${CLR_DIM}(Port 80 Subdomain Ingress)${CLR_RESET}" ;;
      postgres) echo -e "  ${CLR_BOLD}- PostgreSQL Database:${CLR_RESET} ${CLR_BLUE}localhost:5432${CLR_RESET}       ${CLR_DIM}(DB: bayesstack)${CLR_RESET}" ;;
      ui)       echo -e "  ${CLR_BOLD}- Storybook UI:${CLR_RESET}        ${CLR_BLUE}http://localhost:6001${CLR_RESET}" ;;
      pgadmin)  echo -e "  ${CLR_BOLD}- PgAdmin Visualizer:${CLR_RESET}  ${CLR_BLUE}http://localhost:5050${CLR_RESET}" ;;
    esac
  done
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  echo -e "  ${CLR_DIM}Press ${CLR_BOLD}Ctrl+C${CLR_RESET} ${CLR_DIM}to gracefully stop all active services.${CLR_RESET}"
  echo -e "${CLR_BOLD}${CLR_CYAN}==========================================================================${CLR_RESET}"
  echo ""
}
