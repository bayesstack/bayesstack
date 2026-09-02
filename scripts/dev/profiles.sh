#!/usr/bin/env bash
# Service profile mappings & service resolution routines

expand_profile() {
  local target="$1"
  case "$target" in
    core|minimal) echo "postgres api auth super learner faculty admin landing nginx" ;;
    learner-flow) echo "postgres api auth learner nginx" ;;
    faculty-flow) echo "postgres api auth faculty nginx" ;;
    admin-flow)   echo "postgres api auth admin nginx" ;;
    super-flow)   echo "postgres api super nginx" ;;
    all)          echo "postgres api landing learner faculty admin auth super ui pgadmin nginx" ;;
    *)            echo "$target" ;;
  esac
}

resolve_services() {
  local raw_args=("$@")
  local expanded_str=""
  for item in "${raw_args[@]}"; do
    expanded_str="$expanded_str $(expand_profile "$item" | tr ',' ' ')"
  done

  local selected=()
  for svc in $expanded_str; do
    if [[ ! " ${selected[*]:-} " =~ " ${svc} " ]]; then
      selected+=("$svc")
    fi
  done
  echo "${selected[@]}"
}
