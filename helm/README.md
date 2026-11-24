# Tastings With Tay Helm

Application source owns the reusable workload contract. Private deployment state owns exact source
commits, image digests, and environment-specific non-secret values. Vault and External Secrets own
credentials.

## Indigo chart

`helm/twt-app` is the shared chart for the separately deployed `twt-web` and `twt-admin` releases.
Use `values-web.yaml` or `values-admin.yaml` for the application contract, then layer the private
environment values from `dsqr-labs/deployments` on top. Images must be selected by OCI digest; tags
are rejected by the chart schema.

The chart enforces:

- two or more replicas with zero-unavailable rolling updates;
- application-pool node placement and its matching dedicated taint toleration;
- non-root, read-only containers without service-account token mounts or Linux capabilities;
- health and database-readiness probes, a disruption budget, and topology spreading;
- Gateway API routing through the shared Indigo gateway;
- default-deny application ingress and egress, exact database egress, and Cilium FQDN egress; and
- an existing Secret projected from Vault by External Secrets.

The source repository never creates runtime credentials. Before Argo syncs a release, infrastructure
must provide its referenced Secret, trusted database CA ConfigMap, gateway, and reciprocal
gateway-side Cilium policy.

## Validate

```sh
nix build .#checks.x86_64-linux.helm
helm lint --strict helm/twt-app \
  -f helm/twt-app/values-web.yaml \
  -f helm/twt-app/ci/values-web.yaml
helm template twt-web helm/twt-app -n twt --kube-version 1.36.0 \
  -f helm/twt-app/values-web.yaml \
  -f helm/twt-app/ci/values-web.yaml
```
