# Tastings With Tay Helm Charts

These charts are rendered by Argo CD from this repository.

## Charts

- `helm/tastingswithtay-web`: public site at `tastingswithtay.com`
- `helm/tastingswithtay-admin`: admin site at `admin.tastingswithtay.com`

## Required Namespace Secrets

Create these in namespace `twt` before syncing:

```sh
kubectl -n twt create secret generic twt-secrets \
  --from-literal=DATABASE_URL='postgres://...' \
  --from-literal=AUTH_SECRET='...' \
  --from-literal=DISCORD_CLIENT_SECRET='...' \
  --from-literal=S3_ACCESS_KEY='...' \
  --from-literal=S3_SECRET_KEY='...' \
  --dry-run=client -o yaml | kubectl apply -f -
```

The namespace also needs `ghcr-creds` for private GHCR pulls if the images are private.

## Render

```sh
nix build .#checks.x86_64-linux.helm
helm lint helm/tastingswithtay-web
helm template twt-web helm/tastingswithtay-web -n twt -f helm/tastingswithtay-web/values-prod.yaml
helm lint helm/tastingswithtay-admin
helm template twt-admin helm/tastingswithtay-admin -n twt -f helm/tastingswithtay-admin/values-prod.yaml
```

## Stamp Image Tags

After image CI publishes `sha-<commit>` tags:

```sh
nix run .#stampChartTags -- --tag sha-<commit> all
```
