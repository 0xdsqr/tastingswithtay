{
  description = "tastingswithtay";

  nixConfig = {
    extra-experimental-features = "nix-command flakes";
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-compat.url = "github:edolstra/flake-compat";
    flake-compat.flake = false;
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";

    # bun2nix for offline Nix builds
    dsqr-dotdev.url = "github:0xdsqr/dsqr-dotdev/main";
    dsqr-dotdev.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      treefmt-nix,
      dsqr-dotdev,
      ...
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSystem = nixpkgs.lib.genAttrs systems;
    in
    {
      # ------------------------------------------------------------
      # Development shell (nix develop .)
      # ------------------------------------------------------------
      devShells = forEachSystem (
        system:
        let
          devConfig = import ./nix/devshell.nix { inherit nixpkgs system; };
        in
        devConfig.devShells.${system}
      );

      # ------------------------------------------------------------
      # Packages
      # ------------------------------------------------------------
      packages = forEachSystem (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          bun2nix = dsqr-dotdev.lib.bun2nix system;
          appPackages = import ./nix/packages.nix { inherit pkgs self bun2nix; };
        in
        {
          inherit (appPackages) web;
          default = appPackages.web;
        }
      );

      # ------------------------------------------------------------
      # Apps (nix run .#<name>)
      # ------------------------------------------------------------
      apps = forEachSystem (system: {
        default = {
          type = "app";
          program = "${self.packages.${system}.web}/bin/tastingswithtay";
        };
      });

      # ------------------------------------------------------------
      # NixOS module (import in your server config)
      # ------------------------------------------------------------
      nixosModules.default = import ./nix/nixos-module.nix {
        defaultPackage = self.packages.x86_64-linux.web;
      };

      # ------------------------------------------------------------
      # Formatter (nix fmt)
      # ------------------------------------------------------------
      formatter = forEachSystem (
        system:
        (treefmt-nix.lib.evalModule nixpkgs.legacyPackages.${system} ./nix/treefmt.nix).config.build.wrapper
      );

      # ------------------------------------------------------------
      # Checks (nix flake check)
      # ------------------------------------------------------------
      checks = forEachSystem (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          bun2nix = dsqr-dotdev.lib.bun2nix system;
          appPackages = import ./nix/packages.nix { inherit pkgs self bun2nix; };
        in
        {
          formatting = (treefmt-nix.lib.evalModule pkgs ./nix/treefmt.nix).config.build.check self;
          build-web = appPackages.web;
        }
      );
    };
}
