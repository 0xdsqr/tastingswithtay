# Fixed-output derivation holding every workspace `node_modules` tree.
#
# The install is pinned to the *target* platform with `--os`/`--cpu`, so the
# tree (and therefore the hash) does not depend on the machine that built it.
# After changing `bun.lock`, refresh the hashes with `./nix/update-hashes.sh`.
{
  lib,
  stdenvNoCC,
  bun,
  cacert,
  # Platform whose optional dependencies are installed; any host can build any target.
  targetSystem ? stdenvNoCC.hostPlatform.system,
}:
let
  hashes = lib.importJSON ./node-modules-hashes.json;
  system = targetSystem;
  platform =
    {
      aarch64-darwin = {
        os = "darwin";
        cpu = "arm64";
      };
      x86_64-darwin = {
        os = "darwin";
        cpu = "x64";
      };
      aarch64-linux = {
        os = "linux";
        cpu = "arm64";
      };
      x86_64-linux = {
        os = "linux";
        cpu = "x64";
      };
    }
    .${system};
in
stdenvNoCC.mkDerivation {
  name = "tastingswithtay-node-modules";

  src = lib.fileset.toSource {
    root = ../..;
    fileset = lib.fileset.unions [
      ../../bun.lock
      ../../bunfig.toml
      ../../package.json
      (lib.fileset.fileFilter (file: file.name == "package.json") ../../apps)
      (lib.fileset.fileFilter (file: file.name == "package.json") ../../packages)
      ../../tooling/typescript/package.json
    ];
  };

  nativeBuildInputs = [
    bun
    cacert
  ];

  dontConfigure = true;
  dontFixup = true;

  # Install straight into the output: copying the tree afterwards would double the build time.
  buildPhase = ''
    runHook preBuild

    export HOME="$TMPDIR/home"
    export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
    mkdir -p "$out"
    cp -R . "$out"
    chmod -R u+w "$out"

    cd "$out"
    bun install \
      --frozen-lockfile \
      --ignore-scripts \
      --no-progress \
      --os=${platform.os} \
      --cpu=${platform.cpu}

    # Bun races when it links the `.bin` shims of packages nested in its store
    # (browserslist <-> update-browserslist-db), so one symlink comes and goes
    # between runs. Nothing uses those nested shims — builds call the top-level
    # and workspace `.bin` directories — so drop them to keep the tree stable.
    find "$out/node_modules/.bun" -type d -name .bin -prune -exec rm -rf {} +

    # Keep only the node_modules trees.
    find "$out" -name node_modules -prune -o -type f -exec rm {} +

    runHook postBuild
  '';

  dontInstall = true;

  outputHashMode = "recursive";
  outputHashAlgo = "sha256";
  outputHash = hashes.${system};
}
