# Package derivations for tastingswithtay
#
# Builds the TanStack Start web app for production.
# Nitro (via vite build) produces a self-contained .output/ directory
# with the server entry at .output/server/index.mjs.
#
# Build order (sequential dependencies):
#   1. bun install (offline via bunConfigHook)
#   2. @twt/db   (Bun.build + tsc -> dist/)
#   3. @twt/core (Bun.build + tsc -> dist/, depends on db)
#   4. vite build for web (nitro produces .output/)
#
# @twt/ui is consumed as raw TypeScript source by Vite (no build step).
#
# To regenerate bun.lock.nix (uses bun2nix from dsqr-dotdev):
#   nix run github:0xdsqr/dsqr-dotdev#generate-deps
#
{
  pkgs,
  self,
  bun2nix,
}:
let
  deps = import "${self}/bun.lock.nix";

  bunDeps = bun2nix.fetchBunDeps {
    inherit deps;
    bunLock = "${self}/bun.lock";
    name = "tastingswithtay-deps";
  };
in
{
  web = pkgs.stdenv.mkDerivation {
    pname = "tastingswithtay";
    version = "0.0.0";
    src = self;
    strictDeps = true;

    nativeBuildInputs = [
      pkgs.bun
      pkgs.nodejs
      bun2nix.bunConfigHook
    ];

    bunOfflineCache = bunDeps;

    buildPhase = ''
      runHook preBuild

      # Build internal packages (sequential: db -> core)
      echo "Building @twt/db..."
      bun run --filter='@twt/db' build

      echo "Building @twt/core..."
      bun run --filter='@twt/core' build

      # Build the app with Vite (nitro produces .output/)
      echo "Building web..."
      bun run --filter='web' build

      runHook postBuild
    '';

    installPhase = ''
      runHook preInstall

      mkdir -p $out

      # Nitro bundles everything into .output/ (server + client assets + deps).
      cp -r apps/web/.output $out/.output

      # Create a wrapper script
      mkdir -p $out/bin
      cat > $out/bin/tastingswithtay <<WRAPPER
#!/bin/sh
exec ${pkgs.nodejs}/bin/node $out/.output/server/index.mjs "\$@"
WRAPPER
      chmod +x $out/bin/tastingswithtay

      runHook postInstall
    '';

    passthru = {
      port = 3000;
      deps = bunDeps;
      node = pkgs.nodejs;
    };
  };
}
