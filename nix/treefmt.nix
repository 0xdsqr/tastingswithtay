{
  projectRootFile = "flake.nix";

  programs = {
    nixfmt.enable = true;
    biome = {
      enable = true;
      settings.formatter = {
        indentStyle = "space";
        indentWidth = 2;
      };
      settings.javascript.formatter = {
        quoteStyle = "double";
        semicolons = "asNeeded";
      };
    };
  };

  settings.global.excludes = [
    "*.lock"
    "*.lockb"
    "*.nix"
    "bun.lock.canary.nix"
    "node_modules/**"
    ".direnv/**"
    ".wrangler/**"
    "dist/**"
  ];
}
