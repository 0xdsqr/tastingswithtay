# Builds both TanStack Start applications from one shared dependency tree and
# exposes each Nitro server bundle as its own output.
{
  lib,
  stdenvNoCC,
  bun,
  nodejs,
  nodeModules,
}:
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-apps";

  src = lib.fileset.toSource {
    root = ../..;
    fileset = lib.fileset.unions [
      ../../apps
      ../../packages
      ../../tooling/typescript
      ../../bun.lock
      ../../bunfig.toml
      ../../package.json
    ];
  };

  outputs = [
    "out"
    "web"
    "admin"
  ];

  nativeBuildInputs = [
    bun
    nodejs
  ];

  dontFixup = true;

  configurePhase = ''
    runHook preConfigure

    export HOME="$TMPDIR/home"
    cp -R ${nodeModules}/. .
    chmod -R u+w .

    # Package binaries use `#!/usr/bin/env node`, which does not exist in the sandbox.
    for binary in node_modules/.bin/* apps/*/node_modules/.bin/* packages/*/node_modules/.bin/*; do
      [ -e "$binary" ] || continue
      patchShebangs --build "$(readlink -f "$binary")"
    done
    export PATH="$PWD/node_modules/.bin:$PATH"

    runHook postConfigure
  '';

  buildPhase = ''
    runHook preBuild

    export NODE_ENV=production
    bun run build:packages
    bun run --filter web build
    bun run --filter admin build

    runHook postBuild
  '';

  doCheck = true;
  checkPhase = ''
    runHook preCheck

    # The admin bundle must carry a working sharp binary for this platform.
    node --input-type=module -e '
      const { default: sharp } = await import("./apps/admin/.output/server/node_modules/sharp/dist/index.mjs")
      await sharp({ create: { width: 1, height: 1, channels: 3, background: "white" } }).webp().toBuffer()
    '

    runHook postCheck
  '';

  installPhase = ''
    runHook preInstall

    cp -R apps/web/.output "$web"
    cp -R apps/admin/.output "$admin"
    mkdir -p "$out"
    ln -s "$web" "$out/web"
    ln -s "$admin" "$out/admin"

    runHook postInstall
  '';
}
