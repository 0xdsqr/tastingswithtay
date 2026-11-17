{
  actionlint,
  lib,
  shellcheck,
  stdenvNoCC,
}:
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-workflow-check";
  src = lib.fileset.toSource {
    root = ../..;
    fileset = ../../.github/workflows;
  };

  nativeBuildInputs = [
    actionlint
    shellcheck
  ];

  dontConfigure = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall

    actionlint .github/workflows/*.yml

    mkdir -p "$out"
    touch "$out/workflow-check"

    runHook postInstall
  '';
}
