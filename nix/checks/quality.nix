# Lint, typecheck, unit tests, and the unused-dependency check, run against
# the same dependency tree the application build uses.
{
  lib,
  stdenvNoCC,
  bun,
  nodejs,
  oxlint,
  nodeModules,
}:
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-quality-check";

  src = lib.fileset.toSource {
    root = ../..;
    fileset = lib.fileset.unions [
      ../../apps
      ../../packages
      ../../scripts
      ../../tooling/typescript
      ../../.oxlintrc.jsonc
      ../../bun.lock
      ../../bunfig.toml
      ../../knip.json
      ../../package.json
      ../../vitest.config.ts
    ];
  };

  nativeBuildInputs = [
    bun
    nodejs
    oxlint
  ];

  dontFixup = true;

  configurePhase = ''
    runHook preConfigure

    export HOME="$TMPDIR/home"
    cp -R ${nodeModules}/. .
    chmod -R u+w .

    for binary in node_modules/.bin/* apps/*/node_modules/.bin/* packages/*/node_modules/.bin/*; do
      [ -e "$binary" ] || continue
      patchShebangs --build "$(readlink -f "$binary")"
    done
    export PATH="$PWD/node_modules/.bin:$PATH"

    runHook postConfigure
  '';

  buildPhase = ''
    runHook preBuild

    bun run lint
    bun run build:packages
    bun run typecheck
    bun run test
    bun run deps:check

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    touch "$out"
    runHook postInstall
  '';
}
