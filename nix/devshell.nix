{
  mkShell,
  actionlint,
  bun,
  jq,
  kubernetes-helm,
  nodejs,
  oxlint,
  postgresql,
  shellcheck,
  treefmt,
  yq-go,
}:
mkShell {
  packages = [
    actionlint
    bun
    jq
    kubernetes-helm
    nodejs
    oxlint
    postgresql
    shellcheck
    treefmt
    yq-go
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"

    echo "tastingswithtay dev shell"
    echo "  node: $(node --version)"
    echo "  bun:  $(bun --version)"
    echo "  helm: $(helm version --short 2>/dev/null | sed 's/^v//')"
  '';
}
