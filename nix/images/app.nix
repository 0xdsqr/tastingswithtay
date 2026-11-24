# OCI image for one application: slim Node, the Nitro bundle, and the
# OpenTelemetry preload. No shell, package manager, or libc userland.
{
  lib,
  dockerTools,
  nodejs-slim,
  cacert,
  otelRuntime,
  name,
  bundle,
  port,
  revision ? null,
}:
dockerTools.streamLayeredImage {
  name = "ghcr.io/0xdsqr/tastingswithtay-${name}";
  tag = if revision == null then "dev" else "sha-${revision}";

  contents = [ cacert ];

  extraCommands = ''
    mkdir -m 1777 tmp
  '';

  config = {
    User = "1000:1000";
    WorkingDir = "${bundle}";
    Env = [
      "NODE_ENV=production"
      "HOST=0.0.0.0"
      "NITRO_HOST=0.0.0.0"
      "PORT=${toString port}"
      "SSL_CERT_FILE=${cacert}/etc/ssl/certs/ca-bundle.crt"
    ];
    ExposedPorts."${toString port}/tcp" = { };
    Cmd = [
      "${nodejs-slim}/bin/node"
      "--import"
      "${otelRuntime}/loader.mjs"
      "--import"
      "${otelRuntime}/instrumentation.mjs"
      "${bundle}/server/index.mjs"
    ];
    Labels = {
      "org.opencontainers.image.source" = "https://github.com/0xdsqr/tastingswithtay";
    }
    // lib.optionalAttrs (revision != null) {
      "org.opencontainers.image.revision" = revision;
    };
  };
}
