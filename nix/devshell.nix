{
  nixpkgs,
  system,
}:
let
  pkgs = import nixpkgs { inherit system; };

  corePackages = with pkgs; [
    bun
    nodejs_22
  ];
in
{
  devShells.${system} = {
    default = pkgs.mkShell {
      buildInputs = corePackages ++ [
        # Nix development tools
        pkgs.nixfmt-rfc-style
        pkgs.nixfmt-tree
        pkgs.statix
        pkgs.deadnix
        pkgs.nil
      ];

      shellHook = ''
        echo "🍷 tastingswithtay dev shell"
        echo "  bun:      $(bun --version)"
        echo "  node:     $(node --version)"
        echo "  nil:      $(nil --version 2>&1 | cut -d' ' -f2)"
      '';
    };

    ci = pkgs.mkShell {
      buildInputs = corePackages;
    };
  };
}
