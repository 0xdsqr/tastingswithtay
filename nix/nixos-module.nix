# NixOS module for tastingswithtay
#
# Declares a systemd service for the tastingswithtay web app (TanStack Start SSR via Nitro).
#
# Usage in your NixOS configuration:
#
#   imports = [ tastingswithtay.nixosModules.default ];
#
#   services.tastingswithtay = {
#     enable = true;
#     environmentFile = "/run/secrets/tastingswithtay.env";
#   };
#
{ defaultPackage }:
{
  config,
  lib,
  ...
}:
let
  cfg = config.services.tastingswithtay;
in
{
  options.services.tastingswithtay = {
    enable = lib.mkEnableOption "tastingswithtay web service";

    package = lib.mkOption {
      type = lib.types.package;
      default = defaultPackage;
      defaultText = lib.literalExpression "self.packages.\${system}.web";
      description = "The tastingswithtay package to run.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3002;
      description = "Port for the web server to listen on.";
    };

    environmentFile = lib.mkOption {
      type = lib.types.nullOr lib.types.path;
      default = null;
      description = ''
        Path to an environment file containing secrets (DATABASE_URL, etc.).
        This file should NOT be in the Nix store.
      '';
    };

    extraEnvironment = lib.mkOption {
      type = lib.types.attrsOf lib.types.str;
      default = { };
      description = "Extra environment variables to set for the service.";
    };

    user = lib.mkOption {
      type = lib.types.str;
      default = "tastingswithtay";
      description = "User to run the service as.";
    };

    group = lib.mkOption {
      type = lib.types.str;
      default = "tastingswithtay";
      description = "Group to run the service as.";
    };
  };

  config = lib.mkIf cfg.enable {
    users.users.tastingswithtay = {
      isSystemUser = true;
      group = cfg.group;
      description = "tastingswithtay service user";
    };
    users.groups.tastingswithtay = { };

    systemd.services.tastingswithtay = {
      description = "tastingswithtay web";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];

      environment = {
        NODE_ENV = "production";
        PORT = toString cfg.port;
      } // cfg.extraEnvironment;

      serviceConfig = {
        Type = "simple";
        ExecStart = "${cfg.package}/bin/tastingswithtay";
        Restart = "always";
        RestartSec = 5;

        User = cfg.user;
        Group = cfg.group;

        EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
        WorkingDirectory = "${cfg.package}";

        # Hardening
        NoNewPrivileges = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectKernelTunables = true;
        ProtectKernelModules = true;
        ProtectControlGroups = true;
        RestrictSUIDSGID = true;
        RestrictNamespaces = true;
        LockPersonality = true;
        RestrictRealtime = true;
        SystemCallArchitectures = "native";
        MemoryDenyWriteExecute = false; # Node.js JIT needs this
      };
    };
  };
}
