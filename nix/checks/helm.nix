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

    for chart in helm/*; do
      [ -d "$chart" ] || continue
      helm lint "$chart"
      helm template "$(basename "$chart")" "$chart" --namespace twt >/dev/null
      helm template "$(basename "$chart")" "$chart" --namespace twt -f "$chart/values-prod.yaml" >/dev/null

      trustedCaRender="$(mktemp)"
      helm template "$(basename "$chart")" "$chart" \
        --namespace twt \
        --set additionalTrustedCa.enabled=true \
        --set additionalTrustedCa.configMapName=dsqr-home-root-ca \
        >"$trustedCaRender"
      grep -F 'name: NODE_EXTRA_CA_CERTS' "$trustedCaRender" >/dev/null
      grep -F 'value: "/etc/dsqr/pki/dsqr-home-root-ca.pem"' "$trustedCaRender" >/dev/null
      grep -F 'name: dsqr-home-root-ca' "$trustedCaRender" >/dev/null
    done

    mkdir -p "$out"
    touch "$out/helm-check"

    runHook postInstall
  '';
}
