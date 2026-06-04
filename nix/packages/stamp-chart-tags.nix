{ pkgs }:
pkgs.writeShellApplication {
  name = "twt-stamp-chart-tags";

  runtimeInputs = [
    pkgs.git
    pkgs.yq-go
  ];

  text = ''
    set -euo pipefail

    usage() {
      cat <<'EOF'
    Usage:
      twt-stamp-chart-tags [--tag sha-<commit>] [all|web|admin...]

    Defaults:
      --tag defaults to sha-$(git rev-parse HEAD)
      app list defaults to all
    EOF
    }

    tag=""
    apps=()

    while [[ $# -gt 0 ]]; do
      case "$1" in
        --tag)
          if [[ $# -lt 2 ]]; then
            echo "--tag requires a value" >&2
            exit 2
          fi
          tag="$2"
          shift 2
          ;;
        -h|--help)
          usage
          exit 0
          ;;
        *)
          apps+=("$1")
          shift
          ;;
      esac
    done

    if [[ -z "$tag" ]]; then
      tag="sha-$(git rev-parse HEAD)"
    fi

    if [[ "$tag" != sha-* ]]; then
      echo "Refusing mutable image tag '$tag'. Use the sha-<commit> tag published by CI." >&2
      exit 2
    fi

    if [[ ''${#apps[@]} -eq 0 ]]; then
      apps=(all)
    fi

    update_app() {
      local app="$1"
      local chart_file
      local values_file

      case "$app" in
        web|twt-web|tastingswithtay-web)
          chart_file="helm/tastingswithtay-web/Chart.yaml"
          values_file="helm/tastingswithtay-web/values-prod.yaml"
          ;;
        admin|twt-admin|tastingswithtay-admin)
          chart_file="helm/tastingswithtay-admin/Chart.yaml"
          values_file="helm/tastingswithtay-admin/values-prod.yaml"
          ;;
        *)
          echo "Unknown app '$app'." >&2
          usage >&2
          exit 2
          ;;
      esac

      yq -i ".appVersion = \"$tag\"" "$chart_file"
      yq -i ".image.tag = \"$tag\"" "$values_file"
      yq -i ".image.pullPolicy = \"IfNotPresent\"" "$values_file"
      echo "$app -> $tag"
    }

    for app in "''${apps[@]}"; do
      if [[ "$app" == all ]]; then
        update_app web
        update_app admin
      else
        update_app "$app"
      fi
    done
  '';
}
