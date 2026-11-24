{
  lib,
  stdenvNoCC,
  kubernetes-helm,
}:
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-helm-check";
  src = lib.fileset.toSource {
    root = ../..;
    fileset = lib.fileset.unions [
      ../../helm
    ];
  };

  nativeBuildInputs = [ kubernetes-helm ];

  dontConfigure = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall

    validate_indigo_release() {
      local application="$1"
      local release="twt-$application"
      local rendered
      rendered="$(mktemp)"

      helm lint --strict helm/twt-app \
        -f "helm/twt-app/values-$application.yaml" \
        -f "helm/twt-app/ci/values-$application.yaml"
      helm template "$release" helm/twt-app \
        --namespace twt \
        --kube-version 1.36.0 \
        -f "helm/twt-app/values-$application.yaml" \
        -f "helm/twt-app/ci/values-$application.yaml" \
        >"$rendered"

      grep -F 'kind: HTTPRoute' "$rendered" >/dev/null
      grep -F 'kind: NetworkPolicy' "$rendered" >/dev/null
      grep -F 'kind: CiliumNetworkPolicy' "$rendered" >/dev/null
      grep -F 'automountServiceAccountToken: false' "$rendered" >/dev/null
      grep -F 'readOnlyRootFilesystem: true' "$rendered" >/dev/null
      grep -F 'allowPrivilegeEscalation: false' "$rendered" >/dev/null
      grep -F 'maxUnavailable: 0' "$rendered" >/dev/null
      grep -F 'platform.dsqr.dev/node-pool' "$rendered" >/dev/null
      grep -F 'platform.dsqr.dev/dedicated' "$rendered" >/dev/null
      grep -E 'image: "ghcr\.io/0xdsqr/tastingswithtay-(web|admin)@sha256:[a-f0-9]{64}"' "$rendered" >/dev/null
      grep -F 'name: NODE_EXTRA_CA_CERTS' "$rendered" >/dev/null
      grep -F 'name: PGSSLROOTCERT' "$rendered" >/dev/null
      if grep -F 'CF-Connecting-IP' "$rendered" >/dev/null; then
        echo "Cloudflare header trust must be opt-in" >&2
        exit 1
      fi
      helm template "$release" helm/twt-app \
        --namespace twt \
        -f "helm/twt-app/values-$application.yaml" \
        -f "helm/twt-app/ci/values-$application.yaml" \
        --set route.cloudflareClientIP=true >"$rendered"
      grep -F 'value: "%REQ(CF-Connecting-IP)%"' "$rendered" >/dev/null
      grep -F 'name: X-Real-IP' "$rendered" >/dev/null
      grep -F 'name: X-Forwarded-For' "$rendered" >/dev/null
    }

    validate_indigo_release web
    validate_indigo_release admin

    if helm template twt-web helm/twt-app \
      --namespace twt \
      -f helm/twt-app/values-web.yaml \
      -f helm/twt-app/ci/values-web.yaml \
      --set-string image.digest=latest >/dev/null 2>&1; then
      echo "twt-app accepted a mutable image reference" >&2
      exit 1
    fi

    if helm template twt-web helm/twt-app \
      --namespace twt \
      -f helm/twt-app/values-web.yaml \
      -f helm/twt-app/ci/values-web.yaml \
      --set replicaCount=1 >/dev/null 2>&1; then
      echo "twt-app accepted a single-replica Indigo release" >&2
      exit 1
    fi

    mkdir -p "$out"
    touch "$out/helm-check"

    runHook postInstall
  '';
}
