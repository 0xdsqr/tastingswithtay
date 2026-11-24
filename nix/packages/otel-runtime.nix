# OpenTelemetry preload modules and their production dependencies. Pure
# JavaScript, so a single hash covers every platform.
{
  lib,
  stdenvNoCC,
  bun,
  cacert,
}:
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-otel-runtime";

  src = lib.fileset.toSource {
    root = ../../tooling/otel-runtime;
    fileset = ../../tooling/otel-runtime;
  };

  nativeBuildInputs = [
    bun
    cacert
  ];

  dontConfigure = true;
  dontFixup = true;

  buildPhase = ''
    runHook preBuild

    export HOME="$TMPDIR/home"
    export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
    bun install --frozen-lockfile --ignore-scripts --no-progress --production

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"
    cp -R node_modules loader.mjs instrumentation.mjs package.json "$out/"

    runHook postInstall
  '';

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = (lib.importJSON ./node-modules-hashes.json).otel-runtime;
}
