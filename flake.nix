{
  description = "tastingswithtay";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      checks = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          helm = pkgs.callPackage ./nix/checks/helm.nix { };
          workflows = pkgs.callPackage ./nix/checks/workflows.nix { };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt-tree);

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              actionlint
              bun
              git
              kubernetes-helm
              nodejs_26
              postgresql
              shellcheck
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
    };
}
