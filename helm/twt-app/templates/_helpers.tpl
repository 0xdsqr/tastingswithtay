{{- define "twt-app.selectorLabels" -}}
app.kubernetes.io/name: twt-app
app.kubernetes.io/instance: {{ .Release.Name | quote }}
{{- end }}

{{- define "twt-app.labels" -}}
{{ include "twt-app.selectorLabels" . }}
app.kubernetes.io/component: {{ .Values.application | quote }}
app.kubernetes.io/part-of: tastingswithtay
app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | quote }}
{{- end }}
