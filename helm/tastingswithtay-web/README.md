# tastingswithtay-web Helm Chart

This chart deploys the Tastings with Tay web app to Kubernetes.

## Prerequisites

- A namespace such as `twt`
- An existing app secret, for example `twt-secrets`
- An existing GHCR image pull secret, for example `ghcr-creds`

## Local Install

```bash
helm upgrade --install twt-web ./helm/tastingswithtay-web \
  --namespace twt \
  --create-namespace \
  -f ./helm/tastingswithtay-web/values-prod.yaml
```

## First Migration From kubectl-managed YAML

Your existing app resources were created outside Helm, so Helm will not automatically adopt them on
the first install. The simplest migration path is:

1. Keep `twt-secrets` and `ghcr-creds` in place.
2. Delete the current app-managed resources such as the deployment, service, ingress, and configmap.
3. Run the Helm install command above.

After that first cutover, future app deploys can go through Helm instead of repeated `kubectl apply`
for each manifest.

## Deploy A Specific Image Tag

```bash
helm upgrade --install twt-web ./helm/tastingswithtay-web \
  --namespace twt \
  --create-namespace \
  -f ./helm/tastingswithtay-web/values-prod.yaml \
  --set image.tag=sha-<commit-sha>
```

## Install From GHCR OCI

```bash
helm registry login ghcr.io -u YOUR_GITHUB_USERNAME

helm upgrade --install twt-web oci://ghcr.io/0xdsqr/charts/tastingswithtay-web \
  --version <published-chart-version> \
  --namespace twt \
  --create-namespace \
  -f ./values-prod.yaml
```

You can override `image.tag`, `env`, ingress settings, or resource requests at deploy time with
`--set` or an additional values file.

If you are installing from GHCR on a VM that does not have this repo checked out, copy the
contents of `values-prod.yaml` into a local file such as `./values-prod.yaml` first.
