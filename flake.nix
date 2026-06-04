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
        stampChartTags = pkgs.callPackage ./nix/packages/stamp-chart-tags.nix { };
      in {
        packages = {
          inherit stampChartTags;
          default = stampChartTags;
        };

        apps = {
          stampChartTags = {
            type = "app";
            program = "${stampChartTags}/bin/twt-stamp-chart-tags";
            meta.description = "Stamp Tastings with Tay Helm chart image tags";
          };
        };

        checks = {
          helm = pkgs.callPackage ./nix/checks/helm.nix { };
        };

        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            bun
            git
            kubernetes-helm
            nodejs_24
            postgresql
            typescript
            yq-go
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"

            echo "tastingswithtay dev shell"
            echo "  node: $(node --version)"
            echo "  bun:  $(bun --version)"
            echo "  helm: $(helm version --short 2>/dev/null | sed 's/^v//')"
          '';
        };
      }
    );
}
