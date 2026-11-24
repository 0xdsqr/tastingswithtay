import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg"
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { NodeSDK } from "@opentelemetry/sdk-node"

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    new HttpInstrumentation(),
    new UndiciInstrumentation(),
    new PgInstrumentation(),
    new AwsInstrumentation(),
  ],
})

sdk.start()

console.info("[otel] tracing initialized", {
  serviceName: process.env.OTEL_SERVICE_NAME ?? "unknown",
})

async function shutdown(signal) {
  try {
    await sdk.shutdown()
  } catch (error) {
    console.error("[otel] tracing shutdown failed", {
      error: error instanceof Error ? error.message : "Unknown OpenTelemetry shutdown error",
    })
  } finally {
    process.kill(process.pid, signal)
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    process.removeAllListeners(signal)
    void shutdown(signal)
  })
}
