{
  description = "tastingswithtay";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            git
            nodejs_24
            postgresql
            typescript
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"

            echo "tastingswithtay dev shell"
            echo "  node: $(node --version)"
            echo "  bun:  $(bun --version)"
          '';
        };
      }
    );
}
