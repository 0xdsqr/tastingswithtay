# Scans every tracked file for committed credentials.
{
  gitleaks,
  runCommand,
  src,
}:
runCommand "tastingswithtay-secrets-check" { nativeBuildInputs = [ gitleaks ]; } ''
  gitleaks dir ${src} --no-banner --redact --exit-code 1
  touch "$out"
''
