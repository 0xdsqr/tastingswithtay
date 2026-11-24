{
  description = "tastingswithtay";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      treefmt-nix,
      ...
    }:
    let
      lib = nixpkgs.lib;
      systems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-darwin"
        "x86_64-linux"
      ];
      revision = self.rev or null;

      perSystem =
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs.nodejs_26;
          treefmt = (treefmt-nix.lib.evalModule pkgs ./nix/treefmt.nix).config.build;

          nodeModulesFor = lib.genAttrs systems (
            targetSystem: pkgs.callPackage ./nix/packages/node-modules.nix { inherit targetSystem; }
          );
          nodeModules = nodeModulesFor.${system};
          otelRuntime = pkgs.callPackage ./nix/packages/otel-runtime.nix { };
          apps = pkgs.callPackage ./nix/packages/apps.nix { inherit nodejs nodeModules; };

          image =
            name: port:
            pkgs.callPackage ./nix/images/app.nix {
              inherit
                name
                port
                otelRuntime
                revision
                ;
              nodejs-slim = pkgs.nodejs-slim_26;
              bundle = apps.${name};
            };
        in
        {
          legacyPackages = { inherit nodeModulesFor; };

          packages = {
            default = apps;
            inherit apps;
            web = apps.web;
            admin = apps.admin;
            node-modules = nodeModules;
            otel-runtime = otelRuntime;
          }
          // lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
            web-image = image "web" 3010;
            admin-image = image "admin" 3011;
          };

          checks = {
            inherit apps;
            formatting = treefmt.check self;
            helm = pkgs.callPackage ./nix/checks/helm.nix { };
            secrets = pkgs.callPackage ./nix/checks/secrets.nix { src = self; };
            quality = pkgs.callPackage ./nix/checks/quality.nix { inherit nodejs nodeModules; };
            workflows = pkgs.callPackage ./nix/checks/workflows.nix { };
          };

          formatter = treefmt.wrapper;

          devShells.default = pkgs.callPackage ./nix/devshell.nix {
            inherit nodejs;
            treefmt = treefmt.wrapper;
          };

          # Registry tooling for the image publishing workflow.
          devShells.ci = pkgs.mkShell {
            packages = [
              pkgs.jq
              pkgs.regclient
              pkgs.skopeo
              pkgs.trivy
            ];
          };
        };

      outputsBySystem = lib.genAttrs systems perSystem;
      collect = name: lib.mapAttrs (_: outputs: outputs.${name}) outputsBySystem;
    in
    {
      legacyPackages = collect "legacyPackages";
      packages = collect "packages";
      checks = collect "checks";
      formatter = collect "formatter";
      devShells = collect "devShells";
    };
}
