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
    done

    mkdir -p "$out"
    touch "$out/helm-check"

    runHook postInstall
  '';
}
