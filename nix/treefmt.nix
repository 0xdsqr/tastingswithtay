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
      settings.css = {
        parser.cssModules = true;
        linter.enabled = false;
        formatter.enabled = false;
      };
      settings.linter.rules = {
        suspicious = {
          noExplicitAny = "off";
          noDoubleEquals = "off";
          noDocumentCookie = "off";
        };
        a11y = {
          useSemanticElements = "off";
          useFocusableInteractive = "off";
          noRedundantRoles = "off";
          useKeyWithClickEvents = "off";
          useAriaPropsForRole = "off";
        };
        correctness = {
          noUnusedImports = "warn";
        };
      };
    };
  };

  settings.global.excludes = [
    "*.lock"
    "*.lockb"
    "*.nix"
    "*.css"
    "bun.lock.canary.nix"
    "node_modules/**"
    ".direnv/**"
    ".wrangler/**"
    "dist/**"
    "**/*.gen.ts"
    "**/*.gen.tsx"
  ];
}
